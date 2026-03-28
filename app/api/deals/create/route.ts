import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
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
      return redirectTo(request, "/auth/login?next=/listings");
    }

    const formData = await request.formData();
    const listingId = String(formData.get("listing_id") || "").trim();
    const returnTo = String(formData.get("return_to") || "").trim() || "/listings";

    if (!listingId) {
      return redirectTo(request, buildErrorPath(returnTo, "missing_listing_id"));
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return redirectTo(request, buildErrorPath(returnTo, "listing_not_found"));
    }

    const sellerId = pickOwnerId(listing);

    if (!sellerId) {
      return redirectTo(request, buildErrorPath(returnTo, "missing_seller_id"));
    }

    if (sellerId === user.id) {
      return redirectTo(
        request,
        buildErrorPath(returnTo, "cannot_deal_with_own_listing")
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
        request,
        buildErrorPath(
          returnTo,
          `existing_deal_check_failed:${existingDealsError.message}`
        )
      );
    }

    const existingDeal = existingDeals?.[0];
    if (existingDeal?.id) {
      return redirectTo(request, `/deal/${existingDeal.id}`);
    }

    const insertPayload = {
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: buyerId,
    };

    const { data: createdDeal, error: createDealError } = await supabase
      .from("deals")
      .insert(insertPayload)
      .select("id")
      .single();

    if (createDealError || !createdDeal?.id) {
      return redirectTo(
        request,
        buildErrorPath(
          returnTo,
          `failed_to_create_deal:${createDealError?.message || "unknown_error"}`
        )
      );
    }

    return redirectTo(request, `/deal/${createdDeal.id}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unexpected_deal_create_error";

    return redirectTo(
      request,
      buildErrorPath("/listings", `failed_to_create_deal:${message}`)
    );
  }
}