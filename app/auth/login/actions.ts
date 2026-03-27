'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function normalizeNext(input: FormDataEntryValue | null) {
  if (typeof input !== 'string') return '/'

  const value = input.trim()

  if (!value) return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//')) return '/'

  return value
}

export async function loginAction(formData: FormData) {
  const supabase = await supabaseServer()

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const next = normalizeNext(formData.get('next'))

  if (!email || !password) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}&error=missing_fields`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}&error=invalid_credentials`)
  }

  redirect(next || '/')
}