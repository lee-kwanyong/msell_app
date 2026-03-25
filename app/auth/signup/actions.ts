'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function buildSignupRedirect(next: string, params: Record<string, string>) {
  const search = new URLSearchParams()

  if (next && next.startsWith('/') && !next.startsWith('//')) {
    search.set('next', next)
  } else {
    search.set('next', '/')
  }

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }

  return `/auth/signup?${search.toString()}`
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').trim()
}

function normalizeGender(value: string) {
  const raw = value.trim().toLowerCase()

  if (raw === 'male' || raw === 'female' || raw === 'other') {
    return raw
  }

  return ''
}

export async function signupAction(formData: FormData) {
  const supabase = await supabaseServer()

  const full_name = String(formData.get('full_name') || '').trim()
  const genderRaw = String(formData.get('gender') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const phone_number_raw = String(formData.get('phone_number') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const password_confirm = String(formData.get('password_confirm') || '').trim()
  const nextRaw = String(formData.get('next') || '/').trim()

  const next =
    nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/'

  const phone_number = normalizePhone(phone_number_raw)
  const gender = normalizeGender(genderRaw)

  if (!full_name || !gender || !email || !phone_number || !password || !password_confirm) {
    redirect(
      buildSignupRedirect(next, {
        error: '모든 필수 항목을 입력해주세요.',
      })
    )
  }

  if (password !== password_confirm) {
    redirect(
      buildSignupRedirect(next, {
        error: '비밀번호 확인이 일치하지 않습니다.',
      })
    )
  }

  if (password.length < 6) {
    redirect(
      buildSignupRedirect(next, {
        error: '비밀번호는 6자 이상이어야 합니다.',
      })
    )
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        gender,
        phone_number,
      },
    },
  })

  if (error) {
    redirect(
      buildSignupRedirect(next, {
        error: error.message,
      })
    )
  }

  const user = data.user

  if (user) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email,
        full_name,
        gender,
        phone_number,
      },
      { onConflict: 'id' }
    )
  }

  redirect(
    `/auth/login?success=${encodeURIComponent(
      '회원가입이 완료되었습니다. 로그인해주세요.'
    )}&next=${encodeURIComponent(next)}`
  )
}