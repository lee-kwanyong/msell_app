'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').slice(0, 20)
}

function normalizeGender(value: string) {
  if (value === 'male' || value === 'female' || value === 'other') return value
  return null
}

export async function updateAccountAction(formData: FormData): Promise<void> {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const fullName = String(formData.get('full_name') ?? '')
    .trim()
    .slice(0, 50)

  const username = String(formData.get('username') ?? '')
    .trim()
    .slice(0, 30)

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
    redirect(`/account?error=${encodeURIComponent(profileError.message)}`)
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
    redirect(`/account?error=${encodeURIComponent(authError.message)}`)
  }

  revalidatePath('/account')
  redirect('/account?saved=1')
}