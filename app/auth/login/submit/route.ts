import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function safeNextPath(value: unknown) {
  if (typeof value !== "string") return "/listings";
  if (!value.startsWith("/")) return "/listings";
  if (value.startsWith("//")) return "/listings";
  return value;
}

function buildRedirectUrl(request: Request, error: string, next: string) {
  return new URL(
    `/auth/login?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`,
    request.url
  );
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();

  const email =
    typeof formData.get("email") === "string"
      ? String(formData.get("email")).trim()
      : "";

  const password =
    typeof formData.get("password") === "string"
      ? String(formData.get("password"))
      : "";

  const intent =
    typeof formData.get("intent") === "string"
      ? String(formData.get("intent"))
      : "login";

  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "missing_fields", next),
      { status: 303 }
    );
  }

  if (intent === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.redirect(
        buildRedirectUrl(request, "signup_failed", next),
        { status: 303 }
      );
    }

    return NextResponse.redirect(new URL(next, request.url), {
      status: 303,
    });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "invalid_credentials", next),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });
}