"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildReturnParams(params: Record<string, string>) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) qs.set(key, value);
  });

  const query = qs.toString();
  return query ? `?${query}` : "";
}

function redirectBackWithError(
  values: Record<string, string>,
  error: string,
  next?: string
) {
  const query = buildReturnParams({
    ...values,
    error,
    next: next || "",
  });

  redirect(`/auth/signup${query}`);
}

function mapSignupError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("email rate limit exceeded")) {
    return "이메일 발송 제한에 걸렸습니다. 잠시 후 다시 시도하거나 관리자에게 SMTP 설정을 확인해 달라고 해주세요.";
  }

  if (lower.includes("user already registered")) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }

  if (lower.includes("invalid email")) {
    return "이메일 형식이 올바르지 않습니다.";
  }

  if (lower.includes("password")) {
    return "비밀번호 조건을 다시 확인해 주세요.";
  }

  return message || "회원가입 중 오류가 발생했습니다.";
}

export async function signupAction(formData: FormData) {
  const supabase = await supabaseServer();
  const headerStore = await headers();

  const full_name = clean(formData.get("full_name"));
  const phone_number = clean(formData.get("phone_number"));
  const email = clean(formData.get("email"));
  const password = clean(formData.get("password"));
  const password_confirm = clean(formData.get("password_confirm"));
  const next = clean(formData.get("next")) || "/";

  const returnValues = {
    full_name,
    phone_number,
    email,
  };

  if (!full_name || !phone_number || !email || !password || !password_confirm) {
    redirectBackWithError(returnValues, "모든 항목을 입력해 주세요.", next);
  }

  if (password !== password_confirm) {
    redirectBackWithError(returnValues, "비밀번호와 비밀번호 확인이 일치하지 않습니다.", next);
  }

  if (password.length < 6) {
    redirectBackWithError(returnValues, "비밀번호는 6자 이상 입력해 주세요.", next);
  }

  const origin =
    headerStore.get("x-forwarded-proto") && headerStore.get("x-forwarded-host")
      ? `${headerStore.get("x-forwarded-proto")}://${headerStore.get("x-forwarded-host")}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const emailRedirectTo = `${origin}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name,
        phone_number,
      },
    },
  });

  if (error) {
    redirectBackWithError(returnValues, mapSignupError(error.message), next);
  }

  redirect(
    `/auth/login?success=${encodeURIComponent(
      "회원가입이 완료되었습니다. 이메일 인증이 필요한 경우 메일함을 확인해 주세요."
    )}&next=${encodeURIComponent(next)}`
  );
}