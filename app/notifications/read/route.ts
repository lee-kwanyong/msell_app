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

function safeReturnTo(value: string, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  return value;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();

  const notificationId = String(formData.get("notification_id") ?? "").trim();
  const returnToRaw = String(formData.get("return_to") ?? "").trim();
  const returnTo = safeReturnTo(returnToRaw, "/notifications");

  if (!user) {
    return redirectTo(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  if (!notificationId) {
    return redirectTo(
      `${returnTo}?error=${encodeURIComponent("알림 ID가 없습니다.")}`
    );
  }

  const { data: notification, error: fetchError } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (fetchError || !notification) {
    return redirectTo(
      `${returnTo}?error=${encodeURIComponent("알림을 찾을 수 없습니다.")}`
    );
  }

  if (String(notification.user_id ?? "") !== user.id) {
    return redirectTo(
      `${returnTo}?error=${encodeURIComponent("알림 처리 권한이 없습니다.")}`
    );
  }

  const updatePayloads = [
    {
      is_read: true,
      updated_at: new Date().toISOString(),
    },
    {
      is_read: true,
    },
  ];

  let success = false;
  let lastError = "read_update_failed";

  for (const payload of updatePayloads) {
    const { error } = await supabase
      .from("notifications")
      .update(payload)
      .eq("id", notificationId);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `${returnTo}?error=${encodeURIComponent(`읽음 처리 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `${returnTo}?success=${encodeURIComponent("알림을 읽음 처리했습니다.")}`
  );
}