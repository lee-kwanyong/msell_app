'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeUsername(value: string | null) {
  if (!value) return null

  const normalized = value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')

  return normalized || null
}

function normalizePhone(value: string | null) {
  if (!value) return null
  const digits = value.replace(/[^0-9]/g, '')
  return digits || null
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const fullName = normalizeText(formData.get('full_name'))
  const usernameRaw = normalizeText(formData.get('username'))
  const username = normalizeUsername(usernameRaw)
  const phoneNumberRaw = normalizeText(formData.get('phone_number'))
  const phoneNumber = normalizePhone(phoneNumberRaw)

  if (!phoneNumber) {
    redirect('/account?error=' + encodeURIComponent('연락처를 입력해야 저장할 수 있습니다.'))
  }

  if (phoneNumber.length < 8) {
    redirect('/account?error=' + encodeURIComponent('연락처 형식이 올바르지 않습니다.'))
  }

  if (username && username.length < 2) {
    redirect('/account?error=' + encodeURIComponent('사용자명은 2자 이상이어야 합니다.'))
  }

  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    username,
    phone_number: phoneNumber,
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message || '계정 저장에 실패했습니다.'))
  }

  revalidatePath('/account')
  redirect('/account?success=1')
}