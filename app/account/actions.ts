'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').trim();
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/account');
  }

  const full_name = String(formData.get('full_name') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const phone_number = normalizePhone(String(formData.get('phone_number') ?? ''));
  const avatar_url = String(formData.get('avatar_url') ?? '').trim();

  if (!full_name) {
    redirect('/account?error=' + encodeURIComponent('이름을 입력해 주세요.'));
  }

  if (!username) {
    redirect('/account?error=' + encodeURIComponent('아이디를 입력해 주세요.'));
  }

  const payload = {
    id: user.id,
    email: user.email ?? '',
    full_name,
    username,
    phone_number: phone_number || null,
    avatar_url: avatar_url || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message));
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name,
      username,
      phone_number: phone_number || null,
      avatar_url: avatar_url || null,
    },
  });

  if (authError) {
    redirect('/account?error=' + encodeURIComponent(authError.message));
  }

  revalidatePath('/account');
  redirect('/account?success=' + encodeURIComponent('계정 정보가 저장되었습니다.'));
}