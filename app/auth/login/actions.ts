'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

function normalizeNext(next: string | null | undefined) {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

async function getOrigin() {
  const headerStore = await headers()
  return headerStore.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const next = normalizeNext(String(formData.get('next') || '/'))

  if (!email || !password) {
    redirect(
      `/auth/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        '이메일과 비밀번호를 입력해 주세요.'
      )}`
    )
  }

  const supabase = await supabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(
      `/auth/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
    )
  }

  redirect(next)
}

export async function signInWithGoogle(next: string) {
  const safeNext = normalizeNext(next)
  const supabase = await supabaseServer()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  })

  if (error || !data?.url) {
    redirect(
      `/auth/login?next=${encodeURIComponent(safeNext)}&error=${encodeURIComponent(
        error?.message || '구글 로그인 연결에 실패했습니다.'
      )}`
    )
  }

  redirect(data.url)
}

export async function signInWithNaver(next: string) {
  const safeNext = normalizeNext(next)
  const supabase = await supabaseServer()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'custom:naver',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  })

  if (error || !data?.url) {
    redirect(
      `/auth/login?next=${encodeURIComponent(safeNext)}&error=${encodeURIComponent(
        error?.message || '네이버 로그인 연결에 실패했습니다.'
      )}`
    )
  }

  redirect(data.url)
}