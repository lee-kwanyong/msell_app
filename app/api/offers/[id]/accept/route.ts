import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await supabaseServer();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const offerId = params.id;

    const { data: offer } = await supabase.from("offers").select("*").eq("id", offerId).single();
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    if (offer.seller_id !== auth.user.id) return NextResponse.json({ error: "Only seller can accept" }, { status: 403 });

    const { error: upErr } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    const { data: deal, error: dealErr } = await supabase
      .from("deals")
      .insert({
        listing_id: offer.listing_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        accepted_offer_id: offer.id,
        status: "in_escrow",
        escrow_amount_krw: offer.price_total_krw,
        escrow_status: "virtual",
      })
      .select("id")
      .single();

    if (dealErr) return NextResponse.json({ error: dealErr.message }, { status: 400 });

    await supabase.from("deal_milestones").insert([
      { deal_id: deal.id, type: "m1_invite", status: "pending" },
      { deal_id: deal.id, type: "m2_ownership", status: "pending" },
      { deal_id: deal.id, type: "m3_handover", status: "pending" },
    ]);

    return NextResponse.json({ dealId: deal.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
