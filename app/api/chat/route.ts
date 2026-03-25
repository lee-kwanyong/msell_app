import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const listingId = body?.listing_id;
    if (!listingId) return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });

    const { data: listing } = await supabase.from("listings").select("id, seller_id").eq("id", listingId).single();
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.seller_id === auth.user.id) return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });

    const { data: existing } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", auth.user.id)
      .eq("seller_id", listing.seller_id)
      .maybeSingle();

    if (existing) return NextResponse.json({ roomId: existing.id });

    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ listing_id: listingId, buyer_id: auth.user.id, seller_id: listing.seller_id })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ roomId: room.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
