import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["active", "paused", "sold", "hidden"] as const;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedStatus(value: string): value is (typeof ALLOWED_STATUSES)[number] {
  return ALLOWED_STATUSES.includes(value as (typeof ALLOWED_STATUSES)[number]);
}

function redirectToMyListings(request: NextRequest, message?: string) {
  const url = new URL("/my/listings", request.url);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url, { status: 303 });
}

function redirectToListing(request: NextRequest, listingId: string, message?: string) {
  const url = new URL(`/listings/${listingId}`, request.url);
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
    loginUrl.searchParams.set("next", "/my/listings");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const formData = await request.formData();

  const listingId = asString(formData.get("id"));
  const status = asString(formData.get("status"));
  const redirectMode = asString(formData.get("redirect")) || "my-listings";

  if (!listingId) {
    return redirectToMyListings(request, "missing_id");
  }

  if (!isAllowedStatus(status)) {
    return redirectToListing(request, listingId, "invalid_status");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return redirectToMyListings(request, "not_found");
  }

  if (listing.user_id !== user.id) {
    return redirectToMyListings(request, "forbidden");
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[/api/listings/status] update error:", updateError);
    return redirectToListing(request, listingId, "update_failed");
  }

  if (redirectMode === "detail") {
    return redirectToListing(request, listingId, "status_updated");
  }

  return redirectToMyListings(request, "status_updated");
}