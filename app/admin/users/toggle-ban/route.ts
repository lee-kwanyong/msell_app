import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/admin";
  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const targetUserIdRaw = formData.get("target_user_id");
  const returnToRaw = formData.get("return_to");

  const targetUserId =
    typeof targetUserIdRaw === "string" ? targetUserIdRaw.trim() : "";
  const returnTo =
    typeof returnToRaw === "string" ? safeReturnTo(returnToRaw.trim()) : "/admin";

  if (!targetUserId) {
    return redirectTo(request, `${returnTo}?error=user_not_found`);
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, `/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!me || me.role !== "admin") {
    return redirectTo(request, `${returnTo}?error=forbidden`);
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("id, role, is_banned")
    .eq("id", targetUserId)
    .maybeSingle();

  if (!target) {
    return redirectTo(request, `${returnTo}?error=user_not_found`);
  }

  if (target.role === "admin") {
    return redirectTo(request, `${returnTo}?error=forbidden`);
  }

  const nextValue = !(target.is_banned === true);

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: nextValue })
    .eq("id", targetUserId);

  if (error) {
    console.error("admin user ban toggle failed:", error);
    return redirectTo(request, `${returnTo}?error=update_failed`);
  }

  return redirectTo(
    request,
    `${returnTo}?success=${nextValue ? "user_banned" : "user_unbanned"}`
  );
}