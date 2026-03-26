'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, '').trim()
}

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .trim()
}

function buildErrorRedirect(message: string) {
  return `/auth/signup?error=${encodeURIComponent(message)}`
}

export async function signupAction(formData: FormData) {
  const supabase = await supabaseServer()

  const fullName = text(formData, 'full_name')
  const gender = text(formData, 'gender')
  const phoneNumberRaw = text(formData, 'phone_number')
  const emailRaw = text(formData, 'email')
  const password = text(formData, 'password')
  const passwordConfirm = text(formData, 'password_confirm')
  const usernameRaw = text(formData, 'username')

  const email = normalizeEmail(emailRaw)
  const phoneNumber = normalizePhone(phoneNumberRaw)
  const username = normalizeUsername(usernameRaw || email.split('@')[0] || '')

  if (!fullName) {
    redirect(buildErrorRedirect('이름을 입력해주세요.'))
  }

  if (!email) {
    redirect(buildErrorRedirect('이메일을 입력해주세요.'))
  }

  if (!password) {
    redirect(buildErrorRedirect('비밀번호를 입력해주세요.'))
  }

  if (password.length < 6) {
    redirect(buildErrorRedirect('비밀번호는 6자 이상이어야 합니다.'))
  }

  if (password !== passwordConfirm) {
    redirect(buildErrorRedirect('비밀번호 확인이 일치하지 않습니다.'))
  }

  if (!username || username.length < 2) {
    redirect(buildErrorRedirect('사용자명은 2자 이상이어야 합니다.'))
  }

  const emailRedirectTo =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : undefined

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
      data: {
        full_name: fullName,
        gender: gender || null,
        phone_number: phoneNumber || null,
        username,
      },
    },
  })

  if (error) {
    const message =
      error.message?.includes('User already registered')
        ? '이미 가입된 이메일입니다. 로그인해 주세요.'
        : error.message || '회원가입에 실패했습니다.'

    redirect(buildErrorRedirect(message))
  }

  const user = data.user

  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          username,
          gender: gender || null,
          phone_number: phoneNumber || null,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      redirect(buildErrorRedirect(profileError.message || '프로필 저장에 실패했습니다.'))
    }
  }

  redirect('/auth/login?message=' + encodeURIComponent('회원가입이 완료되었습니다. 로그인해 주세요.'))
}