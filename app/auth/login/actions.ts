'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function safeNextPath(input: string) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export async function loginAction(formData: FormData) {
  const supabase = await supabaseServer()

  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')
  const next = safeNextPath(text(formData, 'next'))

  if (!email) {
    redirect(`/auth/login?error=${encodeURIComponent('이메일을 입력해주세요.')}&next=${encodeURIComponent(next)}`)
  }

  if (!password) {
    redirect(`/auth/login?error=${encodeURIComponent('비밀번호를 입력해주세요.')}&next=${encodeURIComponent(next)}`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(error.message || '이메일 로그인에 실패했습니다.')}&next=${encodeURIComponent(next)}`
    )
  }

  redirect(next || '/')
}