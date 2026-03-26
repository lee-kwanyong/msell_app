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
  const phoneNumber = normalizeText(formData.get('phone_number'))
  const gender = normalizeText(formData.get('gender'))

  if (username && username.length < 2) {
    redirect('/account?error=' + encodeURIComponent('사용자명은 2자 이상이어야 합니다.'))
  }

  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    username,
    phone_number: phoneNumber,
    gender,
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