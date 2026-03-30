import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  const formData = await request.formData();
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return NextResponse.redirect(new URL("/my/listings", request.url), 303);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=/listings/${id}/edit`, request.url),
      303
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id,seller_id")
    .eq("id", id)
    .single();

  if (listingError || !listing) {
    return NextResponse.redirect(new URL("/my/listings", request.url), 303);
  }

  if (listing.seller_id !== user.id) {
    return NextResponse.redirect(new URL(`/listings/${id}`, request.url), 303);
  }

  const { error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (deleteError) {
    return NextResponse.redirect(
      new URL(`/listings/${id}/edit?error=${encodeURIComponent(deleteError.message)}`, request.url),
      303
    );
  }

  return NextResponse.redirect(new URL("/my/listings", request.url), 303);
}