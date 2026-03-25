import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function buildUrl(request: Request, returnTo?: string, fallback?: string) {
  const base = new URL(request.url);
  return new URL(
    returnTo && returnTo.trim() ? returnTo : fallback || "/",
    `${base.protocol}//${base.host}`
  );
}

function redirectWithError(url: URL, code: string) {
  url.searchParams.set("error", code);
  return NextResponse.redirect(url, { status: 303 });
}

function redirectWithSuccess(url: URL, code: string) {
  url.searchParams.set("success", code);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const targetUserId = String(formData.get("target_user_id") || "").trim();
  const returnTo = String(formData.get("return_to") || "").trim();

  const returnUrl = buildUrl(request, returnTo, "/");

  if (!targetUserId) {
    return redirectWithError(returnUrl, "invalid_target");
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = buildUrl(request, "/auth/login");
    loginUrl.searchParams.set("next", returnTo || "/");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const [{ data: me }, { data: target }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, is_banned")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .maybeSingle(),
  ]);

  if (me?.is_banned === true) {
    return redirectWithError(returnUrl, "banned_user");
  }

  if (!target) {
    return redirectWithError(returnUrl, "invalid_target");
  }

  if (user.id === targetUserId) {
    return redirectWithError(returnUrl, "cannot_block_self");
  }

  const { data: existingBlock } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("user_id", user.id)
    .eq("blocked_user_id", targetUserId)
    .maybeSingle();

  if (existingBlock?.id) {
    const { error: deleteError } = await supabase
      .from("user_blocks")
      .delete()
      .eq("id", existingBlock.id);

    if (deleteError) {
      return redirectWithError(returnUrl, "block_toggle_failed");
    }

    return redirectWithSuccess(returnUrl, "unblocked");
  }

  const { error: insertError } = await supabase.from("user_blocks").insert({
    user_id: user.id,
    blocked_user_id: targetUserId,
  });

  if (insertError) {
    return redirectWithError(returnUrl, "block_toggle_failed");
  }

  return redirectWithSuccess(returnUrl, "blocked");
}