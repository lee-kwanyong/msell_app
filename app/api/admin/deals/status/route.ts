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
  if (!value) return "/admin/deals";
  if (!value.startsWith("/")) return "/admin/deals";
  return value;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();
  const dealId = String(formData.get("deal_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/admin/deals"));

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

  if (!dealId) {
    return redirectTo(`${next}?error=${encodeURIComponent("대상 거래 ID가 없습니다.")}`);
  }

  if (!["inquiry", "active", "completed", "cancelled", "disputed"].includes(status)) {
    return redirectTo(`${next}?error=${encodeURIComponent("허용되지 않은 거래 상태입니다.")}`);
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
  let lastError = "deal_status_update_failed";

  for (const payload of payloads) {
    const { error } = await supabase
      .from("deals")
      .update(payload)
      .eq("id", dealId);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `${next}?error=${encodeURIComponent(`거래 상태 변경 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `${next}?success=${encodeURIComponent("거래 상태를 변경했습니다.")}`
  );
}