'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

function normalizeUsername(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 30)
}

async function getBaseUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto =
    h.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  if (!host) return 'http://localhost:3000'
  return `${proto}://${host}`
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '').trim()
  const passwordConfirm = String(formData.get('password_confirm') ?? '').trim()
  const fullName = String(formData.get('full_name') ?? '').trim()
  const usernameRaw = String(formData.get('username') ?? '').trim()
  const username = normalizeUsername(usernameRaw || email.split('@')[0] || 'user')
  const phoneNumber = String(formData.get('phone_number') ?? '').trim()
  const gender = String(formData.get('gender') ?? '').trim()
  const next = safeNextPath(String(formData.get('next') ?? '/'))

  if (!email || !password) {
    redirect(`/auth/signup?error=${encodeURIComponent('이메일과 비밀번호를 입력해 주세요.')}&next=${encodeURIComponent(next)}`)
  }

  if (!fullName) {
    redirect(`/auth/signup?error=${encodeURIComponent('이름을 입력해 주세요.')}&next=${encodeURIComponent(next)}`)
  }

  if (password.length < 8) {
    redirect(`/auth/signup?error=${encodeURIComponent('비밀번호는 8자 이상이어야 합니다.')}&next=${encodeURIComponent(next)}`)
  }

  if (password !== passwordConfirm) {
    redirect(`/auth/signup?error=${encodeURIComponent('비밀번호 확인이 일치하지 않습니다.')}&next=${encodeURIComponent(next)}`)
  }

  const supabase = await supabaseServer()
  const baseUrl = await getBaseUrl()
  const emailRedirectTo = new URL('/auth/callback', baseUrl)
  emailRedirectTo.searchParams.set('next', next)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: emailRedirectTo.toString(),
      data: {
        full_name: fullName,
        username,
        phone_number: phoneNumber,
        gender,
      },
    },
  })

  if (error) {
    redirect(
      `/auth/signup?error=${encodeURIComponent(error.message || '회원가입에 실패했습니다.')}&next=${encodeURIComponent(next)}`
    )
  }

  const userId = data.user?.id

  if (userId) {
    const profilePayload: Record<string, any> = {
      id: userId,
      email,
      full_name: fullName,
      username,
    }

    if (phoneNumber) profilePayload.phone_number = phoneNumber
    if (gender) profilePayload.gender = gender

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })

    if (profileError) {
      console.error('profiles upsert warning:', profileError.message)
    }
  }

  redirect(
    `/auth/login?message=signup_success&success=${encodeURIComponent(
      '회원가입이 완료되었습니다. 로그인해 주세요.'
    )}&next=${encodeURIComponent(next)}`
  )
}