import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileUpsertPayload = {
  id: string
  email: string | null
  full_name: string | null
  username: string | null
  phone_number: string | null
  gender: string | null
  updated_at: string
}

function pickFirstString(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function normalizeGender(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()

  if (['male', 'm', 'man', '남', '남성'].includes(v)) return 'male'
  if (['female', 'f', 'woman', '여', '여성'].includes(v)) return 'female'

  return null
}

function buildProfilePayload(user: any): ProfileUpsertPayload {
  const metadata = user?.user_metadata ?? {}
  const identities = Array.isArray(user?.identities) ? user.identities : []

  const firstIdentityData =
    identities.find((item: any) => item?.identity_data)?.identity_data ?? {}

  const email = pickFirstString(
    user?.email,
    metadata?.email,
    firstIdentityData?.email,
    firstIdentityData?.contact_email,
  )

  const fullName = pickFirstString(
    metadata?.full_name,
    metadata?.name,
    metadata?.nickname,
    metadata?.user_name,
    firstIdentityData?.name,
    firstIdentityData?.full_name,
    firstIdentityData?.nickname,
  )

  const username = pickFirstString(
    metadata?.username,
    metadata?.preferred_username,
    metadata?.user_name,
    firstIdentityData?.preferred_username,
    firstIdentityData?.nickname,
    email ? email.split('@')[0] : null,
  )

  const phoneNumber = pickFirstString(
    metadata?.phone_number,
    metadata?.phone,
    user?.phone,
    firstIdentityData?.mobile,
    firstIdentityData?.mobile_e164,
    firstIdentityData?.phone_number,
  )

  const gender = normalizeGender(
    metadata?.gender ?? firstIdentityData?.gender
  )

  return {
    id: user.id,
    email,
    full_name: fullName,
    username,
    phone_number: phoneNumber,
    gender,
    updated_at: new Date().toISOString(),
  }
}

function hasMissingCoreProfile(profile: {
  full_name?: string | null
  username?: string | null
  phone_number?: string | null
}) {
  return !profile.full_name || !profile.username || !profile.phone_number
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const loginPath = next.startsWith('/m') ? '/m/auth/login' : '/auth/login'

  if (error) {
    const message = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${message}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${encodeURIComponent('missing_code')}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  const supabase = await supabaseServer()

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${encodeURIComponent(exchangeError.message || 'oauth_callback_failed')}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${encodeURIComponent(userError?.message || 'missing_user_after_callback')}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  const payload = buildProfilePayload(user)

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name, username, phone_number, gender')
    .eq('id', user.id)
    .maybeSingle()

  const { error: upsertError } = await supabase.from('profiles').upsert(payload, {
    onConflict: 'id',
  })

  if (upsertError) {
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${encodeURIComponent(upsertError.message || 'profile_sync_failed')}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  const mergedProfile = {
    full_name: payload.full_name ?? existingProfile?.full_name ?? null,
    username: payload.username ?? existingProfile?.username ?? null,
    phone_number: payload.phone_number ?? existingProfile?.phone_number ?? null,
  }

  if (hasMissingCoreProfile(mergedProfile)) {
    return NextResponse.redirect(new URL('/account?welcome=social', requestUrl.origin))
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}