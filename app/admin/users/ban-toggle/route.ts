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
  if (!value) return "/admin/users";
  if (!value.startsWith("/")) return "/admin/users";
  return value;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();
  const userId = String(formData.get("user_id") ?? "").trim();
  const ban = String(formData.get("ban") ?? "").trim() === "true";
  const next = safeNext(String(formData.get("next") ?? "/admin/users"));

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

  if (!userId) {
    return redirectTo(`${next}?error=${encodeURIComponent("대상 사용자 ID가 없습니다.")}`);
  }

  if (userId === user.id) {
    return redirectTo(`${next}?error=${encodeURIComponent("본인 계정은 차단할 수 없습니다.")}`);
  }

  const payloads = [
    {
      is_banned: ban,
      updated_at: new Date().toISOString(),
    },
    {
      is_banned: ban,
    },
  ];

  let success = false;
  let lastError = "ban_toggle_failed";

  for (const payload of payloads) {
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `${next}?error=${encodeURIComponent(`사용자 상태 변경 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `${next}?success=${encodeURIComponent(
      ban ? "사용자를 차단했습니다." : "사용자 차단을 해제했습니다."
    )}`
  );
}