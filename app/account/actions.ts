'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function pickString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeGender(value: string) {
  if (!value) return null
  if (value === 'male' || value === 'female') return value
  return null
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const fullName = pickString(formData, 'full_name')
  const username = pickString(formData, 'username')
  const phoneNumber = pickString(formData, 'phone_number')
  const gender = normalizeGender(pickString(formData, 'gender'))

  if (!fullName) {
    redirect('/account?error=이름을 입력해주세요.')
  }

  if (!username) {
    redirect('/account?error=아이디를 입력해주세요.')
  }

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    username,
    phone_number: phoneNumber || null,
    gender,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('profiles').upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message || '저장에 실패했습니다.')}`)
  }

  redirect('/account?success=저장되었습니다.')
}