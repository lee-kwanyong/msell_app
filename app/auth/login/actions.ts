'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const next = safeNextPath(String(formData.get('next') || '/'))

  if (!email || !password) {
    redirect(
      `/auth/login?error=${encodeURIComponent(
        '이메일과 비밀번호를 입력해 주세요.'
      )}&next=${encodeURIComponent(next)}`
    )
  }

  const supabase = await supabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(
        '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해 주세요.'
      )}&next=${encodeURIComponent(next)}`
    )
  }

  redirect(next)
}