import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const origin = getOrigin(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();
  const listingId = String(formData.get("listing_id") || "").trim();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent("/my/listings")}`,
      { status: 303 }
    );
  }

  if (!listingId) {
    return NextResponse.redirect(`${origin}/my/listings?error=listing_not_found`, {
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

  if (listing.status === "deleted") {
    return NextResponse.redirect(`${origin}/my/listings?deleted=1`, {
      status: 303,
    });
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "deleted" })
    .eq("id", listingId);

  if (updateError) {
    return NextResponse.redirect(`${origin}/my/listings?error=delete_failed`, {
      status: 303,
    });
  }

  const { data: deals } = await supabase
    .from("deals")
    .select("buyer_id")
    .eq("listing_id", listingId);

  const targetUserIds = Array.from(
    new Set(
      (deals || [])
        .map((deal) => deal.buyer_id)
        .filter((buyerId) => !!buyerId && buyerId !== user.id)
    )
  );

  if (targetUserIds.length > 0) {
    await supabase.from("notifications").insert(
      targetUserIds.map((targetUserId) => ({
        user_id: targetUserId,
        actor_id: user.id,
        listing_id: listingId,
        type: "listing_deleted",
        title: "등록글 삭제",
        body: `${listing.title || "등록글"}이 더 이상 공개되지 않습니다.`,
      }))
    );
  }

  return NextResponse.redirect(`${origin}/my/listings?deleted=1`, {
    status: 303,
  });
}