import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_STATUSES = new Set([
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const);

function buildUrl(request: Request, returnTo?: string, fallback?: string) {
  const base = new URL(request.url);
  return new URL(
    returnTo && returnTo.trim() ? returnTo : fallback || "/my/deals",
    `${base.protocol}//${base.host}`
  );
}

function redirectWithError(url: URL, code: string) {
  url.searchParams.set("error", code);
  return NextResponse.redirect(url, { status: 303 });
}

function redirectWithSuccess(url: URL) {
  url.searchParams.set("status_updated", "1");
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const dealId = String(formData.get("deal_id") || "").trim();
  const nextStatus = String(formData.get("status") || "").trim();
  const returnTo = String(formData.get("return_to") || "").trim();

  const returnUrl = buildUrl(request, returnTo, dealId ? `/deal/${dealId}` : "/my/deals");

  if (!dealId || !ALLOWED_STATUSES.has(nextStatus as never)) {
    return redirectWithError(returnUrl, "invalid_status");
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = buildUrl(request, "/auth/login");
    loginUrl.searchParams.set("next", returnTo || `/deal/${dealId}`);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("id, listing_id, buyer_id, seller_id, status")
    .eq("id", dealId)
    .single();

  if (dealError || !deal) {
    return redirectWithError(returnUrl, "deal_not_found");
  }

  const isParticipant = deal.buyer_id === user.id || deal.seller_id === user.id;
  if (!isParticipant) {
    return redirectWithError(returnUrl, "forbidden");
  }

  const { error: updateDealError } = await supabase
    .from("deals")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  if (updateDealError) {
    return redirectWithError(returnUrl, "status_update_failed");
  }

  if (nextStatus === "completed" && deal.listing_id) {
    await supabase
      .from("listings")
      .update({
        status: "closed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", deal.listing_id)
      .eq("user_id", deal.seller_id);
  }

  const otherUserId = deal.buyer_id === user.id ? deal.seller_id : deal.buyer_id;

  if (otherUserId && otherUserId !== user.id) {
    const statusLabel =
      nextStatus === "completed"
        ? "거래 완료"
        : nextStatus === "cancelled"
          ? "거래 취소"
          : nextStatus === "in_progress"
            ? "진행 중"
            : "문의 시작";

    await supabase.from("notifications").insert({
      user_id: otherUserId,
      deal_id: dealId,
      type: "deal_update",
      title: "거래 상태가 변경되었습니다",
      body: `상대방이 거래 상태를 '${statusLabel}'(으)로 변경했습니다.`,
      is_read: false,
    });
  }

  return redirectWithSuccess(returnUrl);
}