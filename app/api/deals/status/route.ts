import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["open", "pending", "closed", "cancelled"] as const;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedStatus(value: string): value is (typeof ALLOWED_STATUSES)[number] {
  return ALLOWED_STATUSES.includes(value as (typeof ALLOWED_STATUSES)[number]);
}

function redirectToMyDeals(request: NextRequest, message?: string) {
  const url = new URL("/my/deals", request.url);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url, { status: 303 });
}

function redirectToDeal(request: NextRequest, dealId: string, message?: string) {
  const url = new URL(`/deal/${dealId}`, request.url);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", "/my/deals");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const formData = await request.formData();

  const dealId = asString(formData.get("id"));
  const status = asString(formData.get("status"));
  const redirectMode = asString(formData.get("redirect")) || "my-deals";

  if (!dealId) {
    return redirectToMyDeals(request, "missing_id");
  }

  if (!isAllowedStatus(status)) {
    return redirectToDeal(request, dealId, "invalid_status");
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("id, buyer_id, seller_id, status")
    .eq("id", dealId)
    .single();

  if (dealError || !deal) {
    return redirectToMyDeals(request, "not_found");
  }

  const isParticipant = deal.buyer_id === user.id || deal.seller_id === user.id;

  if (!isParticipant) {
    return redirectToMyDeals(request, "forbidden");
  }

  const { error: updateError } = await supabase
    .from("deals")
    .update({ status })
    .eq("id", dealId);

  if (updateError) {
    console.error("[/api/deals/status] update error:", updateError);
    return redirectToDeal(request, dealId, "update_failed");
  }

  if (redirectMode === "detail") {
    return redirectToDeal(request, dealId, "status_updated");
  }

  return redirectToMyDeals(request, "status_updated");
}