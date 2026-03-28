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

function encodeError(message: string) {
  return encodeURIComponent(message);
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
    const returnTo = String(formData.get("return_to") || "").trim();

    if (!listingId) {
      return redirectTo(
        request,
        `${returnTo || "/listings"}?error=${encodeError("missing_listing_id")}`
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return redirectTo(
        request,
        `${returnTo || "/listings"}?error=${encodeError("listing_not_found")}`
      );
    }

    const sellerId = pickOwnerId(listing);

    if (!sellerId) {
      return redirectTo(
        request,
        `${returnTo || `/listings/${listingId}`}?error=${encodeError("missing_seller_id")}`
      );
    }

    if (sellerId === user.id) {
      return redirectTo(
        request,
        `${returnTo || `/listings/${listingId}`}?error=${encodeError("cannot_deal_with_own_listing")}`
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
        `${returnTo || `/listings/${listingId}`}?error=${encodeError(existingDealsError.message)}`
      );
    }

    const existingDeal = existingDeals?.[0];
    if (existingDeal?.id) {
      return redirectTo(request, `/deal/${existingDeal.id}`);
    }

    const payloadVariants: Record<string, any>[] = [
      {
        listing_id: listingId,
        seller_id: sellerId,
        buyer_id: buyerId,
        status: "open",
      },
      {
        listing_id: listingId,
        seller_id: sellerId,
        buyer_id: buyerId,
      },
      {
        listing_id: listingId,
        seller_id: sellerId,
        buyer_id: buyerId,
        status: "pending",
      },
      {
        listing_id: listingId,
        seller_id: sellerId,
        buyer_id: buyerId,
        status: "active",
      },
    ];

    let lastErrorMessage = "failed_to_create_deal";

    for (const payload of payloadVariants) {
      const { data: createdDeal, error: createDealError } = await supabase
        .from("deals")
        .insert(payload)
        .select("id")
        .single();

      if (!createDealError && createdDeal?.id) {
        return redirectTo(request, `/deal/${createdDeal.id}`);
      }

      if (createDealError) {
        lastErrorMessage = createDealError.message;

        if (
          createDealError.message.toLowerCase().includes("duplicate") ||
          createDealError.message.toLowerCase().includes("unique")
        ) {
          const { data: duplicatedDeals } = await supabase
            .from("deals")
            .select("id")
            .eq("listing_id", listingId)
            .eq("seller_id", sellerId)
            .eq("buyer_id", buyerId)
            .limit(1);

          if (duplicatedDeals?.[0]?.id) {
            return redirectTo(request, `/deal/${duplicatedDeals[0].id}`);
          }
        }

        if (
          createDealError.message.includes("column") &&
          createDealError.message.includes("does not exist")
        ) {
          continue;
        }

        if (
          createDealError.message.toLowerCase().includes("null value") ||
          createDealError.message.toLowerCase().includes("violates not-null")
        ) {
          continue;
        }

        if (
          createDealError.message.toLowerCase().includes("invalid input value for enum")
        ) {
          continue;
        }
      }
    }

    return redirectTo(
      request,
      `${returnTo || `/listings/${listingId}`}?error=${encodeError(lastErrorMessage)}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "failed_to_create_deal";

    return redirectTo(
      request,
      `/listings?error=${encodeError(message)}`
    );
  }
}