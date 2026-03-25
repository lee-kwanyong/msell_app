import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sb = await supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { nda_id?: string; id?: string } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const ndaId = body.nda_id || body.id;

  if (!ndaId) {
    return NextResponse.json(
      { error: "nda_id is required" },
      { status: 400 }
    );
  }

  const { data: nda, error: ndaError } = await sb
    .from("ndas")
    .select("*")
    .eq("id", ndaId)
    .single();

  if (ndaError || !nda) {
    return NextResponse.json({ error: "NDA not found" }, { status: 404 });
  }

  const payload: Record<string, unknown> = {
    status: "approved",
  };

  if ("approved_by" in nda) payload.approved_by = user.id;
  if ("approved_at" in nda) payload.approved_at = new Date().toISOString();
  if ("updated_at" in nda) payload.updated_at = new Date().toISOString();

  const { data: updated, error: updateError } = await sb
    .from("ndas")
    .update(payload)
    .eq("id", ndaId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || "Failed to approve NDA" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    nda: updated,
  });
}