import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function pickUsername(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const v = String(value ?? '').trim();
    if (v) {
      return v
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);
    }
  }
  return '';
}

function pickFullName(user: any) {
  const metadata = user?.user_metadata ?? {};
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    metadata.nickname ||
    metadata.nick ||
    ''
  );
}

function pickAvatarUrl(user: any) {
  const metadata = user?.user_metadata ?? {};
  return (
    metadata.avatar_url ||
    metadata.picture ||
    metadata.profile_image ||
    metadata.profile_image_url ||
    ''
  );
}

function pickPhoneNumber(user: any) {
  const metadata = user?.user_metadata ?? {};
  return metadata.phone_number || metadata.mobile || metadata.phone || '';
}

function buildSafeNext(nextValue: string | null) {
  if (!nextValue) return '/';
  if (!nextValue.startsWith('/')) return '/';
  if (nextValue.startsWith('//')) return '/';
  return nextValue;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = buildSafeNext(requestUrl.searchParams.get('next'));
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set(
      'error',
      errorDescription || error || '소셜 로그인 처리 중 오류가 발생했습니다.',
    );
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', '인증 코드가 없습니다.');
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await supabaseServer();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', exchangeError.message);
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', '로그인 정보를 불러오지 못했습니다.');
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  const metadata = user.user_metadata ?? {};
  const full_name = String(pickFullName(user) || '').trim();
  const avatar_url = String(pickAvatarUrl(user) || '').trim();
  const phone_number = String(pickPhoneNumber(user) || '').trim();

  let username = pickUsername(
    metadata.username,
    metadata.user_name,
    metadata.nickname,
    metadata.nick,
    full_name,
    user.email?.split('@')[0],
    user.id.slice(0, 8),
  );

  if (!username) {
    username = `user_${user.id.slice(0, 8)}`;
  }

  const profilePayload = {
    id: user.id,
    email: user.email ?? '',
    full_name: full_name || null,
    username,
    phone_number: phone_number || null,
    avatar_url: avatar_url || null,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

  await supabase.auth.updateUser({
    data: {
      full_name: full_name || null,
      username,
      phone_number: phone_number || null,
      avatar_url: avatar_url || null,
    },
  });

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}