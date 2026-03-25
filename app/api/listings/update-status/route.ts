import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["active", "hidden", "sold"] as const;

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "판매 중";
    case "hidden":
      return "숨김";
    case "sold":
      return "판매 완료";
    default:
      return status;
  }
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const origin = getOrigin(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();
  const listingId = String(formData.get("listing_id") || "").trim();
  const nextStatus = String(formData.get("status") || "").trim();
  const returnTo =
    String(formData.get("return_to") || "").trim() || `/listings/${listingId}`;

  if (!user) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent(returnTo)}`,
      { status: 303 }
    );
  }

  if (
    !listingId ||
    !ALLOWED_STATUSES.includes(
      nextStatus as (typeof ALLOWED_STATUSES)[number]
    )
  ) {
    return NextResponse.redirect(`${origin}${returnTo}?error=invalid_listing_status`, {
      status: 303,
    });
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, title, status")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.redirect(`${origin}/my/listings?error=listing_not_found`, {
      status: 303,
    });
  }

  if (listing.user_id !== user.id) {
    return NextResponse.redirect(`${origin}/my/listings?error=forbidden`, {
      status: 303,
    });
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: nextStatus })
    .eq("id", listingId);

  if (updateError) {
    return NextResponse.redirect(`${origin}${returnTo}?error=listing_status_update_failed`, {
      status: 303,
    });
  }

  if (nextStatus === "sold") {
    const { data: deals } = await supabase
      .from("deals")
      .select("id, buyer_id, seller_id")
      .eq("listing_id", listingId);

    const targets = (deals || [])
      .map((deal) => deal.buyer_id)
      .filter((buyerId) => !!buyerId && buyerId !== user.id);

    if (targets.length > 0) {
      await supabase.from("notifications").insert(
        targets.map((targetUserId) => ({
          user_id: targetUserId,
          actor_id: user.id,
          listing_id: listingId,
          type: "listing_sold",
          title: "등록글 상태 변경",
          body: `${listing.title || "등록글"} 상태가 '${getStatusLabel(nextStatus)}'로 변경되었습니다.`,
        }))
      );
    }
  }

  return NextResponse.redirect(`${origin}${returnTo}?listing_status_updated=1`, {
    status: 303,
  });
}