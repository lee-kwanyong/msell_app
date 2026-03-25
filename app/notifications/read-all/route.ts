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

export async function POST() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo("/auth/login?next=/notifications");
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
  let lastError = "read_all_update_failed";

  for (const payload of updatePayloads) {
    const { error } = await supabase
      .from("notifications")
      .update(payload)
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `/notifications?error=${encodeURIComponent(`전체 읽음 처리 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `/notifications?success=${encodeURIComponent("모든 알림을 읽음 처리했습니다.")}`
  );
}