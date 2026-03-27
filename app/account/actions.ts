'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function clean(value: FormDataEntryValue | null) {
  return String(value || '').trim()
}

function safeNext(next?: string) {
  const value = String(next || '').trim()
  if (!value.startsWith('/')) return '/account'
  if (value.startsWith('//')) return '/account'
  return value || '/account'
}

export async function saveAccountAction(formData: FormData) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const next = safeNext(formData.get('next'))
  const full_name = clean(formData.get('full_name'))
  const username = clean(formData.get('username'))
  const phone_number = clean(formData.get('phone_number'))
  const gender = clean(formData.get('gender'))

  if (!full_name) {
    redirect(`${next}?error=${encodeURIComponent('이름을 입력해 주세요.')}`)
  }

  const payload = {
    id: user.id,
    full_name,
    username: username || null,
    phone_number: phone_number || null,
    gender: gender || null,
    email: user.email || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })

  if (error) {
    redirect(`${next}?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`${next}?saved=1`)
}