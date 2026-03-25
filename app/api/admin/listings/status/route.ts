import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function makeAbsoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return new URL(path, base);
}

function redirectTo(path: string) {
  return NextResponse.redirect(makeAbsoluteUrl(path), { status: 303 });
}

function safeNext(value: string) {
  if (!value) return "/admin/listings";
  if (!value.startsWith("/")) return "/admin/listings";
  return value;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/admin/listings"));

  if (!user) {
    return redirectTo(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  const [{ data: meRaw }, { data: adminCheckRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.rpc("is_admin"),
  ]);

  const isAdmin =
    adminCheckRaw === true ||
    meRaw?.role === "admin";

  if (!isAdmin) {
    return redirectTo(`${next}?error=${encodeURIComponent("관리자 권한이 없습니다.")}`);
  }

  if (!listingId) {
    return redirectTo(`${next}?error=${encodeURIComponent("대상 매물 ID가 없습니다.")}`);
  }

  if (
    ![
      "draft",
      "pending_review",
      "active",
      "reserved",
      "sold",
      "hidden",
      "rejected",
      "archived",
    ].includes(status)
  ) {
    return redirectTo(`${next}?error=${encodeURIComponent("허용되지 않은 매물 상태입니다.")}`);
  }

  const payloads = [
    {
      status,
      updated_at: new Date().toISOString(),
    },
    {
      status,
    },
  ];

  let success = false;
  let lastError = "listing_status_update_failed";

  for (const payload of payloads) {
    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", listingId);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `${next}?error=${encodeURIComponent(`매물 상태 변경 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `${next}?success=${encodeURIComponent("매물 상태를 변경했습니다.")}`
  );
}