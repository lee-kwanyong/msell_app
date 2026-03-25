"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function sanitizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function sanitizePhone(value: string) {
  return value.trim();
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const usernameRaw = String(formData.get("username") ?? "").trim();
  const phoneNumber = sanitizePhone(String(formData.get("phone_number") ?? ""));
  const username = sanitizeUsername(usernameRaw);

  if (!fullName || !username) {
    redirect(
      `/account?error=${encodeURIComponent("이름과 닉네임은 필수입니다.")}`
    );
  }

  if (username.length < 2) {
    redirect(
      `/account?error=${encodeURIComponent("닉네임은 2자 이상이어야 합니다.")}`
    );
  }

  if (!/^[a-z0-9._-]+$/.test(username)) {
    redirect(
      `/account?error=${encodeURIComponent(
        "닉네임은 영문 소문자, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다."
      )}`
    );
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect(
      `/account?error=${encodeURIComponent("이미 사용 중인 닉네임입니다.")}`
    );
  }

  const payloads = [
    {
      id: user.id,
      email: user.email ?? null,
      username,
      full_name: fullName,
      phone_number: phoneNumber || null,
      updated_at: new Date().toISOString(),
    },
    {
      id: user.id,
      email: user.email ?? null,
      username,
      full_name: fullName,
      phone_number: phoneNumber || null,
    },
  ];

  let success = false;
  let lastError = "profile_upsert_failed";

  for (const payload of payloads) {
    const { error } = await supabase.from("profiles").upsert(payload);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    redirect(
      `/account?error=${encodeURIComponent(`계정 저장 실패: ${lastError}`)}`
    );
  }

  redirect(
    `/account?success=${encodeURIComponent("계정 정보가 저장되었습니다.")}`
  );
}