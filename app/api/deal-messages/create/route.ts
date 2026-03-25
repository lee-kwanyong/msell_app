import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function getBaseUrl(req: NextRequest) {
  return new URL(req.url).origin;
}

function redirectToDeal(req: NextRequest, dealId: string, error?: string) {
  const url = new URL(`/deal/${dealId}`, getBaseUrl(req));
  if (error) {
    url.searchParams.set("error", error);
  }
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const formData = await req.formData();

  const dealId = String(formData.get("deal_id") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!dealId || !message) {
    return dealId
      ? redirectToDeal(req, dealId, "missing_required_fields")
      : NextResponse.redirect(new URL("/my/deals?error=missing_required_fields", getBaseUrl(req)), {
          status: 303,
        });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", getBaseUrl(req));
    loginUrl.searchParams.set("next", `/deal/${dealId}`);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("id, buyer_id, seller_id, status")
    .eq("id", dealId)
    .maybeSingle();

  if (dealError || !deal) {
    return redirectToDeal(req, dealId, "deal_not_found");
  }

  const isParticipant = deal.buyer_id === user.id || deal.seller_id === user.id;
  if (!isParticipant) {
    return redirectToDeal(req, dealId, "forbidden");
  }

  const { error: insertError } = await supabase.from("deal_messages").insert({
    deal_id: dealId,
    sender_id: user.id,
    message,
  });

  if (insertError) {
    return redirectToDeal(req, dealId, "failed_to_send_message");
  }

  return redirectToDeal(req, dealId);
}