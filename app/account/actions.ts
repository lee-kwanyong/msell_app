'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login?next=/account');
  }

  const full_name = getString(formData, 'full_name');
  const username = getString(formData, 'username');
  const phone_number = getString(formData, 'phone_number');
  const gender = getString(formData, 'gender');

  if (!full_name) {
    redirect('/account?error=' + encodeURIComponent('이름을 입력해주세요.'));
  }

  const profilePayload = {
    id: user.id,
    email: user.email ?? null,
    full_name,
    username: username || null,
    phone_number: phone_number || null,
    gender: gender || null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (profileError) {
    redirect(
      '/account?error=' +
        encodeURIComponent(profileError.message || '프로필 저장 중 오류가 발생했습니다.'),
    );
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name,
      username: username || null,
      phone_number: phone_number || null,
      gender: gender || null,
    },
  });

  if (authError) {
    redirect(
      '/account?error=' +
        encodeURIComponent(authError.message || '계정 정보 저장 중 오류가 발생했습니다.'),
    );
  }

  redirect('/account?updated=1');
}