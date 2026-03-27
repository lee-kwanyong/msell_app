import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(path: string) {
  return NextResponse.redirect(path, { status: 303 });
}

function pickOwnerId(listing: Record<string, any>) {
  return (
    listing.seller_id ||
    listing.user_id ||
    listing.owner_id ||
    listing.profile_id ||
    null
  );
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectTo("/auth/login?next=/listings");
  }

  const formData = await request.formData();
  const listingId = String(formData.get("listing_id") || "").trim();
  const returnTo = String(formData.get("return_to") || "").trim();

  if (!listingId) {
    return redirectTo(
      `${returnTo || "/listings"}?error=${encodeURIComponent("missing_listing_id")}`
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return redirectTo(
      `${returnTo || "/listings"}?error=${encodeURIComponent("listing_not_found")}`
    );
  }

  const sellerId = pickOwnerId(listing);

  if (!sellerId) {
    return redirectTo(
      `${returnTo || `/listings/${listingId}`}?error=${encodeURIComponent("missing_seller_id")}`
    );
  }

  if (sellerId === user.id) {
    return redirectTo(
      `${returnTo || `/listings/${listingId}`}?error=${encodeURIComponent("cannot_deal_with_own_listing")}`
    );
  }

  const buyerId = user.id;

  const { data: existingDeals, error: existingDealsError } = await supabase
    .from("deals")
    .select("id, listing_id, seller_id, buyer_id")
    .eq("listing_id", listingId)
    .eq("seller_id", sellerId)
    .eq("buyer_id", buyerId)
    .limit(1);

  if (existingDealsError) {
    return redirectTo(
      `${returnTo || `/listings/${listingId}`}?error=${encodeURIComponent("failed_to_check_existing_deal")}`
    );
  }

  const existingDeal = existingDeals?.[0];
  if (existingDeal?.id) {
    return redirectTo(`/deal/${existingDeal.id}`);
  }

  const insertPayload: Record<string, any> = {
    listing_id: listingId,
    seller_id: sellerId,
    buyer_id: buyerId,
  };

  if ("status" in listing) {
    insertPayload.status = "open";
  }

  const { data: createdDeal, error: createDealError } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select("id")
    .single();

  if (createDealError || !createdDeal?.id) {
    return redirectTo(
      `${returnTo || `/listings/${listingId}`}?error=${encodeURIComponent("failed_to_create_deal")}`
    );
  }

  return redirectTo(`/deal/${createdDeal.id}`);
}