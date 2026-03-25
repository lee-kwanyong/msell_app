import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function safeNext(next: string | null) {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const next = safeNext(String(formData.get("next") || "/"));

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(
        `/auth/signup?next=${encodeURIComponent(next)}&error=missing_fields`,
        request.url
      ),
      { status: 303 }
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(
        `/auth/signup?next=${encodeURIComponent(next)}&error=password_too_short`,
        request.url
      ),
      { status: 303 }
    );
  }

  const supabase = await supabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/signup?next=${encodeURIComponent(next)}&error=signup_failed`,
        request.url
      ),
      { status: 303 }
    );
  }

  const userId = data.user?.id ?? null;
  const userEmail = data.user?.email ?? email;

  if (userId) {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: userEmail,
        role: "user",
        is_banned: false,
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });
}