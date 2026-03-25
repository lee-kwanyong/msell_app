import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_REASONS = new Set([
  "spam",
  "fraud",
  "abuse",
  "illegal",
  "other",
] as const);

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

function redirectWithSuccess(url: URL) {
  url.searchParams.set("success", "report_created");
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const targetUserId = String(formData.get("target_user_id") || "").trim() || null;
  const listingId = String(formData.get("listing_id") || "").trim() || null;
  const dealId = String(formData.get("deal_id") || "").trim() || null;
  const reason = String(formData.get("reason") || "").trim();
  const detail = String(formData.get("detail") || "").trim() || null;
  const returnTo = String(formData.get("return_to") || "").trim();

  const fallback =
    dealId ? `/deal/${dealId}` : listingId ? `/listings/${listingId}` : "/";
  const returnUrl = buildUrl(request, returnTo, fallback);

  if (!ALLOWED_REASONS.has(reason as never)) {
    return redirectWithError(returnUrl, "invalid_reason");
  }

  if (!targetUserId && !listingId && !dealId) {
    return redirectWithError(returnUrl, "missing_target");
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = buildUrl(request, "/auth/login");
    loginUrl.searchParams.set("next", returnTo || fallback);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.is_banned === true) {
    return redirectWithError(returnUrl, "banned_user");
  }

  if (targetUserId && targetUserId === user.id) {
    return redirectWithError(returnUrl, "cannot_report_self");
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_user_id: targetUserId,
    listing_id: listingId,
    deal_id: dealId,
    reason,
    detail,
    status: "pending",
  });

  if (error) {
    return redirectWithError(returnUrl, "report_create_failed");
  }

  return redirectWithSuccess(returnUrl);
}