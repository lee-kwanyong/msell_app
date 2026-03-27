'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

function buildSafeNext(nextValue: string | null) {
  if (!nextValue) return '/';
  if (!nextValue.startsWith('/')) return '/';
  if (nextValue.startsWith('//')) return '/';
  return nextValue;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = buildSafeNext(String(formData.get('next') ?? '/'));

  if (!email) {
    redirect(
      `/auth/login?error=${encodeURIComponent('이메일을 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  if (!password) {
    redirect(
      `/auth/login?error=${encodeURIComponent('비밀번호를 입력해 주세요.')}&next=${encodeURIComponent(next)}`
    );
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(next);
}