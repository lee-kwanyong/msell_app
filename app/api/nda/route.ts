import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ct = req.headers.get("content-type") || "";
    let listing_id: string | null = null;

    if (ct.includes("application/json")) {
      const body = await req.json();
      listing_id = body?.listing_id ?? null;
    } else {
      const form = await req.formData();
      listing_id = (form.get("listing_id") as string) || null;
    }

    if (!listing_id) return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });

    const { data: tpl } = await supabase
      .from("nda_templates")
      .select("version")
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const version = tpl?.version ?? 1;

    const h = await headers();
    const ip = h.get("x-forwarded-for") || "";
    const ua = h.get("user-agent") || "";

    const { error } = await supabase.from("nda_acceptances").upsert({
      listing_id,
      buyer_id: auth.user.id,
      template_version: version,
      ip,
      user_agent: ua,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // if form POST, redirect back
    if (!ct.includes("application/json")) {
      return NextResponse.redirect(new URL(`/listings/${listing_id}`, req.url));
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
