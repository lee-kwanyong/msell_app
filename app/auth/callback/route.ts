import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizePhone(raw: string) {
  return raw.replace(/[^\d+]/g, "");
}

function makeUsernameCandidate(...values: unknown[]) {
  const picked = pickFirstString(...values).toLowerCase();
  const cleaned = picked
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .slice(0, 24);

  if (cleaned.length >= 3) return cleaned;
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}

function extractProfileData(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata ?? {};

  const fullName = pickFirstString(
    meta.full_name,
    meta.name,
    meta.user_name,
    meta.nickname,
    meta.nick_name
  );

  const username = makeUsernameCandidate(
    meta.user_name,
    meta.preferred_username,
    meta.nickname,
    meta.nick_name,
    user.email?.split("@")[0]
  );

  const phoneNumber = normalizePhone(
    pickFirstString(
      meta.phone_number,
      meta.phone,
      meta.mobile,
      meta.tel,
      meta.contact
    )
  );

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: fullName || null,
    username: username || null,
    phone_number: phoneNumber || null,
  };
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const redirectUrl = new URL(next, requestUrl.origin);

  if (error) {
    const loginUrl = new URL("/auth/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set(
      "error",
      errorDescription || error || "로그인 처리 중 오류가 발생했습니다."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/auth/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", "인증 코드가 없습니다.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await supabaseServer();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    const loginUrl = new URL("/auth/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set(
      "error",
      exchangeError.message || "세션 교환에 실패했습니다."
    );
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set(
      "error",
      userError?.message || "사용자 정보를 불러오지 못했습니다."
    );
    return NextResponse.redirect(loginUrl);
  }

  const profilePayload = extractProfileData({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata ?? {},
  });

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, phone_number")
    .eq("id", user.id)
    .maybeSingle();

  const mergedProfile = {
    id: user.id,
    email:
      pickFirstString(existingProfile?.email, profilePayload.email) || null,
    full_name:
      pickFirstString(existingProfile?.full_name, profilePayload.full_name) ||
      null,
    username:
      pickFirstString(existingProfile?.username, profilePayload.username) || null,
    phone_number:
      pickFirstString(
        existingProfile?.phone_number,
        profilePayload.phone_number
      ) || null,
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(mergedProfile, { onConflict: "id" });

  if (upsertError) {
    const loginUrl = new URL("/auth/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set(
      "error",
      upsertError.message || "프로필 동기화에 실패했습니다."
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(redirectUrl);
}