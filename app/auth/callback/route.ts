import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function pickString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const normalized = pickString(value);
    if (normalized) return normalized;
  }
  return "";
}

function normalizeUsername(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 30);
}

function buildFallbackUsername(email: string, name: string, userId: string) {
  const fromEmail = email.split("@")[0] || "";
  const base =
    normalizeUsername(fromEmail) ||
    normalizeUsername(name) ||
    `user${userId.replace(/-/g, "").slice(0, 8)}`;

  return base.slice(0, 30);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";
  const oauthError =
    url.searchParams.get("error") ||
    url.searchParams.get("error_code") ||
    url.searchParams.get("error_description");

  const redirectUrl = new URL(next, url.origin);

  if (oauthError) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", oauthError);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", "로그인 인증 코드가 없습니다.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await supabaseServer();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/auth/login", url.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set(
      "error",
      userError?.message || "사용자 정보를 불러오지 못했습니다."
    );
    return NextResponse.redirect(loginUrl);
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const identities = Array.isArray(user.identities) ? user.identities : [];
  const firstIdentity =
    identities.length > 0
      ? ((identities[0]?.identity_data || {}) as Record<string, unknown>)
      : {};

  const email = firstNonEmpty(
    user.email,
    metadata.email,
    firstIdentity.email
  );

  const fullName = firstNonEmpty(
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.nickname,
    firstIdentity.full_name,
    firstIdentity.name,
    firstIdentity.nickname
  );

  const phoneNumber = firstNonEmpty(
    metadata.phone_number,
    metadata.phone,
    metadata.mobile,
    metadata.tel,
    firstIdentity.phone_number,
    firstIdentity.phone,
    firstIdentity.mobile
  );

  const avatarUrl = firstNonEmpty(
    metadata.avatar_url,
    metadata.picture,
    firstIdentity.avatar_url,
    firstIdentity.picture
  );

  const provider = firstNonEmpty(
    metadata.provider,
    user.app_metadata?.provider,
    identities[0]?.provider
  );

  const providerId = firstNonEmpty(
    metadata.provider_id,
    firstIdentity.sub,
    firstIdentity.id
  );

  const wantedUsername = buildFallbackUsername(email, fullName, user.id);

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  let finalUsername: string | null =
    pickString(existingProfile?.username) || wantedUsername || null;

  if (finalUsername) {
    const { data: usernameOwner } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();

    if (usernameOwner && usernameOwner.id !== user.id) {
      finalUsername = `${finalUsername.slice(0, 20)}_${user.id.replace(/-/g, "").slice(0, 6)}`;
    }
  }

  const profilePayload = {
    id: user.id,
    email: email || user.email || null,
    full_name: fullName || null,
    phone_number: phoneNumber || null,
    username: finalUsername,
    avatar_url: avatarUrl || null,
    provider: provider || null,
    provider_id: providerId || null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (upsertError) {
    const accountUrl = new URL("/account", url.origin);
    accountUrl.searchParams.set("error", upsertError.message);
    return NextResponse.redirect(accountUrl);
  }

  const authDataPayload = {
    full_name: fullName || null,
    phone_number: phoneNumber || null,
    username: finalUsername,
    avatar_url: avatarUrl || null,
  };

  await supabase.auth.updateUser({
    data: authDataPayload,
  });

  return NextResponse.redirect(redirectUrl);
}