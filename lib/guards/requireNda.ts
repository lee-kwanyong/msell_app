import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireApprovedNda(listingId: string) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/auth/login?next=/listings/${listingId}`);
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id,owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    redirect("/listings");
  }

  if (listing.owner_id === user.id) {
    return user;
  }

  const { data: nda, error: ndaError } = await supabase
    .from("nda_requests")
    .select("status")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (ndaError || !nda || nda.status !== "approved") {
    redirect(`/listings/${listingId}?needNda=1`);
  }

  return user;
}