import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceNegotiableRaw = String(formData.get("price_negotiable") ?? "false").trim();
  const transferMethod = String(formData.get("transfer_method") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!id || !title || !category || !priceRaw || !transferMethod || !description) {
    return NextResponse.redirect(
      new URL(`/listings/${id}/edit`, request.url),
      303
    );
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.redirect(
      new URL(`/listings/${id}/edit`, request.url),
      303
    );
  }

  const allowedStatus = new Set([
    "draft",
    "pending_review",
    "active",
    "reserved",
    "sold",
    "hidden",
    "rejected",
    "archived",
  ]);

  if (!allowedStatus.has(status)) {
    return NextResponse.redirect(
      new URL(`/listings/${id}/edit`, request.url),
      303
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=/listings/${id}/edit`, request.url),
      303
    );
  }

  const { data: existing } = await supabase
    .from("listings")
    .select("id,user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.redirect(new URL(`/listings/${id}`, request.url), 303);
  }

  const finalDescription = `[이전 방식] ${transferMethod}\n\n${description}`;
  const priceNegotiable = priceNegotiableRaw === "true";

  const { error } = await supabase
    .from("listings")
    .update({
      title,
      category,
      price,
      price_negotiable: priceNegotiable,
      description: finalDescription,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.redirect(new URL(`/listings/${id}/edit`, request.url), 303);
  }

  return NextResponse.redirect(new URL(`/listings/${id}`, request.url), 303);
}