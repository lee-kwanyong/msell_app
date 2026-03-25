import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function getBaseUrl(req: NextRequest) {
  return new URL(req.url).origin;
}

function redirectWithError(req: NextRequest, listingId: string | null, error: string) {
  const baseUrl = getBaseUrl(req);
  const url = new URL(listingId ? `/listings/${listingId}` : "/listings", baseUrl);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const formData = await req.formData();

  const listingId = String(formData.get("listing_id") || "").trim();
  const returnToRaw = String(formData.get("return_to") || "").trim();

  if (!listingId) {
    return redirectWithError(req, null, "missing_required_fields");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", getBaseUrl(req));
    loginUrl.searchParams.set("next", returnToRaw || `/listings/${listingId}`);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, title, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return redirectWithError(req, listingId, "listing_not_found");
  }

  const blockedStatuses = ["draft", "hidden", "rejected", "archived", "sold"];
  if (blockedStatuses.includes(listing.status)) {
    return redirectWithError(req, listingId, "listing_not_available");
  }

  if (!listing.user_id) {
    return redirectWithError(req, listingId, "seller_not_found");
  }

  if (listing.user_id === user.id) {
    return redirectWithError(req, listingId, "cannot_deal_with_own_listing");
  }

  const { data: existingDeal, error: existingDealError } = await supabase
    .from("deals")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .eq("seller_id", listing.user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingDealError) {
    return redirectWithError(req, listingId, "failed_to_check_existing_deal");
  }

  if (existingDeal?.id) {
    return NextResponse.redirect(new URL(`/deal/${existingDeal.id}`, getBaseUrl(req)), {
      status: 303,
    });
  }

  const insertPayload = {
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.user_id,
    status: "open",
  };

  const { data: createdDeal, error: createError } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select("id")
    .single();

  if (createError || !createdDeal) {
    return redirectWithError(req, listingId, "failed_to_create_deal");
  }

  return NextResponse.redirect(new URL(`/deal/${createdDeal.id}`, getBaseUrl(req)), {
    status: 303,
  });
}