import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function buildErrorPath(basePath: string, message: string) {
  return `${basePath}?error=${encodeURIComponent(message)}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirectTo(request, "/auth/login?next=/my/deals");
    }

    const formData = await request.formData();
    const dealId = String(formData.get("deal_id") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!dealId) {
      return redirectTo(
        request,
        buildErrorPath("/my/deals", "missing_deal_id")
      );
    }

    if (!message) {
      return redirectTo(
        request,
        buildErrorPath(`/deal/${dealId}`, "메시지를 입력해 주세요.")
      );
    }

    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("id, seller_id, buyer_id, listing_id")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return redirectTo(
        request,
        buildErrorPath("/my/deals", "deal_not_found")
      );
    }

    const isParticipant =
      deal.seller_id === user.id || deal.buyer_id === user.id;

    if (!isParticipant) {
      return redirectTo(
        request,
        buildErrorPath(`/deal/${dealId}`, "not_deal_participant")
      );
    }

    const insertPayload = {
      deal_id: dealId,
      sender_id: user.id,
      message,
    };

    const { error: insertError } = await supabase
      .from("deal_messages")
      .insert(insertPayload);

    if (insertError) {
      return redirectTo(
        request,
        buildErrorPath(
          `/deal/${dealId}`,
          `failed_to_send_message:${insertError.message}`
        )
      );
    }

    return redirectTo(
      request,
      `/deal/${dealId}?success=${encodeURIComponent("메시지를 보냈습니다.")}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unexpected_message_send_error";

    const formData = await request.formData().catch(() => null);
    const dealId = String(formData?.get("deal_id") || "").trim();

    return redirectTo(
      request,
      buildErrorPath(
        dealId ? `/deal/${dealId}` : "/my/deals",
        `failed_to_send_message:${message}`
      )
    );
  }
}