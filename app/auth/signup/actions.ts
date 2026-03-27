'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').trim();
}

function buildSafeNext(nextValue: string | null) {
  if (!nextValue) return '/';
  if (!nextValue.startsWith('/')) return '/';
  if (nextValue.startsWith('//')) return '/';
  return nextValue;
}

function buildUsername(email: string, fullName: string) {
  const fromName = fullName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '');

  if (fromName) return fromName.slice(0, 24);

  const fromEmail = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');

  if (fromEmail) return fromEmail.slice(0, 24);

  return `user_${Date.now().toString().slice(-8)}`;
}

export async function signupAction(formData: FormData) {
  const full_name = String(formData.get('full_name') ?? '').trim();
  const gender = String(formData.get('gender') ?? '').trim();
  const phone_number = normalizePhone(String(formData.get('phone_number') ?? ''));
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const password_confirm = String(formData.get('password_confirm') ?? '');
  const next = buildSafeNext(String(formData.get('next') ?? '/'));

  if (!full_name) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('이름을 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (!gender) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('성별을 선택해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (!phone_number) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('연락처를 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (!email) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('이메일을 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (!password) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('비밀번호를 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (password.length < 6) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('비밀번호는 6자 이상이어야 합니다.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (password !== password_confirm) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('비밀번호 확인이 일치하지 않습니다.')}&next=${encodeURIComponent(next)}`
    );
  }

  const username = buildUsername(email, full_name);
  const supabase = await supabaseServer();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name,
        username,
        gender,
        phone_number,
      },
    },
  });

  if (error) {
    redirect(
      `/auth/signup?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    );
  }

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email,
        full_name,
        username,
        gender,
        phone_number,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      redirect(
        `/auth/signup?error=${encodeURIComponent(profileError.message)}&next=${encodeURIComponent(next)}`
      );
    }
  }

  if (data.session) {
    redirect(next);
  }

  redirect(
    `/auth/login?success=${encodeURIComponent('회원가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.')}&next=${encodeURIComponent(next)}`
  );
}