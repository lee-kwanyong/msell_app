import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { ndaId } = await req.json();
  const sb = supabaseServer();

  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1️⃣ NDA 상태 변경
  const { data: nda } = await sb
    .from("nda_requests")
    .update({ status: "approved" })
    .eq("id", ndaId)
    .select("*")
    .single();

  if (!nda) return NextResponse.json({ error: "NDA not found" }, { status: 404 });

  // 2️⃣ Deal 생성
  await sb.from("deals").insert({
    listing_id: nda.listing_id,
    buyer_id: nda.buyer_id,
    seller_id: auth.user.id,
    stage: "DUE_DILIGENCE",
  });

  return NextResponse.json({ success: true });
}