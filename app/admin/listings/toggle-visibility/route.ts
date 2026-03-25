import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/admin";
  return value;
}

function safeStatus(value: string | null | undefined) {
  if (value === "active") return "active";
  if (value === "hidden") return "hidden";
  return null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const listingIdRaw = formData.get("listing_id");
  const statusRaw = formData.get("status");
  const returnToRaw = formData.get("return_to");

  const listingId = typeof listingIdRaw === "string" ? listingIdRaw.trim() : "";
  const status = typeof statusRaw === "string" ? safeStatus(statusRaw.trim()) : null;
  const returnTo =
    typeof returnToRaw === "string" ? safeReturnTo(returnToRaw.trim()) : "/admin";

  if (!listingId || !status) {
    return redirectTo(request, `${returnTo}?error=invalid_status`);
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, `/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!me || me.role !== "admin") {
    return redirectTo(request, `${returnTo}?error=forbidden`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) {
    return redirectTo(request, `${returnTo}?error=listing_not_found`);
  }

  const { error } = await supabase
    .from("listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) {
    console.error("admin listing visibility update failed:", error);
    return redirectTo(request, `${returnTo}?error=update_failed`);
  }

  return redirectTo(
    request,
    `${returnTo}?success=${status === "hidden" ? "listing_hidden" : "listing_activated"}`
  );
}