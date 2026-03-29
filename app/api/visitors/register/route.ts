import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const COOKIE_NAME = "msell_visitor_token";
const ONE_YEAR = 60 * 60 * 24 * 365;

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function makeToken() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const existingToken = cookieStore.get(COOKIE_NAME)?.value?.trim() || "";
    const token = existingToken || makeToken();

    const supabase = getAdminSupabase();

    const { data: existingRow, error: existingError } = await supabase
      .from("visitor_tokens")
      .select("token")
      .eq("token", token)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { ok: false, error: existingError.message },
        { status: 500 }
      );
    }

    let incremented = false;

    if (!existingRow) {
      const { error: insertError } = await supabase
        .from("visitor_tokens")
        .insert({ token });

      if (insertError) {
        return NextResponse.json(
          { ok: false, error: insertError.message },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabase.rpc("increment_total_visitors");

      if (updateError) {
        return NextResponse.json(
          { ok: false, error: updateError.message },
          { status: 500 }
        );
      }

      incremented = true;
    }

    const { data: statRow, error: statError } = await supabase
      .from("site_stats")
      .select("total_visitors")
      .eq("id", 1)
      .maybeSingle();

    if (statError) {
      return NextResponse.json(
        { ok: false, error: statError.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      incremented,
      totalVisitors: statRow?.total_visitors ?? 0,
    });

    if (!existingToken) {
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_YEAR,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to register visitor.",
      },
      { status: 500 }
    );
  }
}