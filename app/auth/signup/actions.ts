"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signupAction(formData: FormData) {
  const sb = await supabaseServer();

  const fullName = getString(formData, "full_name");
  const gender = getString(formData, "gender");
  const phoneNumber = getString(formData, "phone_number");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const passwordConfirm = getString(formData, "password_confirm");

  if (!fullName || !gender || !phoneNumber || !email || !password || !passwordConfirm) {
    redirect("/auth/signup?error=모든 항목을 입력해주세요.");
  }

  if (password !== passwordConfirm) {
    redirect("/auth/signup?error=비밀번호가 일치하지 않습니다.");
  }

  if (password.length < 6) {
    redirect("/auth/signup?error=비밀번호는 6자 이상이어야 합니다.");
  }

  const { error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        gender,
        phone_number: phoneNumber,
      },
    },
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/auth/login?ok=회원가입이 완료되었습니다. 로그인해주세요."
  );
}