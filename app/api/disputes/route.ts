import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const deal_id = String(form.get("deal_id") || "");
  const reason_code = String(form.get("reason_code") || "other");
  const claim_text = String(form.get("claim_text") || "");

  if (!deal_id) return NextResponse.redirect(new URL("/deals", req.url));

  await supabase.from("disputes").insert({
    deal_id,
    opened_by: auth.user.id,
    reason_code,
    claim_text,
    status: "open",
  });

  await supabase.from("deals").update({ status: "dispute" }).eq("id", deal_id);

  return NextResponse.redirect(new URL(`/deals/${deal_id}`, req.url));
}
