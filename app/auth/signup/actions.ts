'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function normalizeNext(next: string | null | undefined) {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

function normalizePhoneNumber(input: string) {
  return input.replace(/[^\d+]/g, '').trim()
}

function buildUsernameFromEmail(email: string) {
  return email.split('@')[0]?.trim() || `user_${Date.now()}`
}

export async function signupAction(formData: FormData) {
  const fullName = String(formData.get('full_name') || '').trim()
  const phoneNumberRaw = String(formData.get('phone_number') || '').trim()
  const phoneNumber = normalizePhoneNumber(phoneNumberRaw)
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '').trim()
  const passwordConfirm = String(formData.get('password_confirm') || '').trim()
  const next = normalizeNext(String(formData.get('next') || '/'))

  if (!fullName || !phoneNumber || !email || !password || !passwordConfirm) {
    redirect(
      `/auth/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        '모든 항목을 입력해 주세요.'
      )}`
    )
  }

  if (password !== passwordConfirm) {
    redirect(
      `/auth/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        '비밀번호가 일치하지 않습니다.'
      )}`
    )
  }

  if (password.length < 8) {
    redirect(
      `/auth/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        '비밀번호는 8자 이상이어야 합니다.'
      )}`
    )
  }

  const username = buildUsernameFromEmail(email)
  const supabase = await supabaseServer()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        username,
      },
    },
  })

  if (error) {
    redirect(
      `/auth/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
    )
  }

  const userId = data.user?.id

  if (userId) {
    await supabase.from('profiles').upsert(
      {
        id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        username,
      },
      { onConflict: 'id' }
    )
  }

  redirect(`/auth/login?next=${encodeURIComponent(next)}`)
}