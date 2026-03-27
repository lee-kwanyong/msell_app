'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').slice(0, 20)
}

function normalizeGender(value: string) {
  if (value === 'male' || value === 'female' || value === 'other') return value
  return null
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: '로그인이 필요합니다.' }
  }

  const fullName = String(formData.get('full_name') ?? '').trim().slice(0, 50)
  const username = String(formData.get('username') ?? '').trim().slice(0, 30)
  const phoneNumber = normalizePhone(String(formData.get('phone_number') ?? ''))
  const gender = normalizeGender(String(formData.get('gender') ?? ''))

  const profilePayload = {
    id: user.id,
    full_name: fullName || null,
    username: username || null,
    phone_number: phoneNumber || null,
    gender,
    updated_at: new Date().toISOString(),
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (profileError) {
    return { ok: false, message: profileError.message }
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      username: username || null,
      phone_number: phoneNumber || null,
      gender,
    },
  })

  if (authError) {
    return { ok: false, message: authError.message }
  }

  revalidatePath('/account')

  return { ok: true, message: '계정 정보가 저장되었습니다.' }
}