"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function normalize(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function encode(message: string) {
  return encodeURIComponent(message);
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const fullName = normalize(formData.get("full_name"));
  const phoneNumber = normalize(formData.get("phone_number"));
  const username = normalize(formData.get("username"));
  const gender = normalize(formData.get("gender"));

  if (!fullName) {
    redirect(`/account?error=${encode("이름을 입력해 주세요.")}`);
  }

  if (!phoneNumber) {
    redirect(`/account?error=${encode("연락처를 입력해 주세요.")}`);
  }

  if (username && !/^[a-zA-Z0-9._]+$/.test(username)) {
    redirect(
      `/account?error=${encode("아이디는 영문, 숫자, 마침표, 밑줄만 사용할 수 있습니다.")}`
    );
  }

  if (gender && !["male", "female", "other"].includes(gender)) {
    redirect(`/account?error=${encode("성별 값이 올바르지 않습니다.")}`);
  }

  const profilePayload = {
    full_name: fullName,
    phone_number: phoneNumber,
    username: username || null,
    gender: gender || null,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profilePayload)
    .eq("id", user.id);

  if (profileError) {
    redirect(`/account?error=${encode(profileError.message)}`);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone_number: phoneNumber,
      username: username || null,
      gender: gender || null,
    },
  });

  if (authError) {
    redirect(`/account?error=${encode(authError.message)}`);
  }

  redirect(`/account?message=${encode("저장되었습니다.")}`);
}