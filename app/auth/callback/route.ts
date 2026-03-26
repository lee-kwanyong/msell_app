import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function makeUsernameCandidate(email: string, fullName: string, userId: string) {
  const localPart = email.split('@')[0] || ''
  const base = firstString(localPart, fullName, `user_${userId.slice(0, 8)}`)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')

  return base || `user_${userId.slice(0, 8)}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin

  const code = url.searchParams.get('code')
  const next = safeNextPath(url.searchParams.get('next'))
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('error', encodeURIComponent(errorDescription || error))
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  if (!code) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('error', encodeURIComponent('로그인 승인 코드가 없습니다.'))
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  const supabase = await supabaseServer()

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set(
      'error',
      encodeURIComponent(exchangeError.message || '소셜 로그인 세션 처리에 실패했습니다.')
    )
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set(
      'error',
      encodeURIComponent(userError?.message || '로그인 사용자 정보를 불러오지 못했습니다.')
    )
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>
  const identities = Array.isArray(user.identities) ? user.identities : []

  const identityData = identities.find(Boolean)?.identity_data as Record<string, unknown> | undefined

  const email = firstString(
    user.email,
    metadata.email,
    identityData?.email
  )

  const fullName = firstString(
    metadata.full_name,
    metadata.name,
    metadata.nickname,
    identityData?.full_name,
    identityData?.name,
    identityData?.nickname
  )

  const username = firstString(
    metadata.user_name,
    metadata.preferred_username,
    metadata.username,
    identityData?.user_name,
    identityData?.preferred_username,
    identityData?.username
  )

  const avatarUrl = firstString(
    metadata.avatar_url,
    metadata.picture,
    identityData?.avatar_url,
    identityData?.picture
  )

  const phoneNumber = firstString(
    user.phone,
    metadata.phone,
    metadata.phone_number,
    identityData?.phone,
    identityData?.phone_number
  )

  const provider = firstString(
    user.app_metadata?.provider,
    metadata.provider,
    identityData?.provider
  )

  const finalUsername = username || makeUsernameCandidate(email, fullName, user.id)

  const profilePayload: Record<string, unknown> = {
    id: user.id,
    email: email || null,
    full_name: fullName || null,
    username: finalUsername || null,
    phone_number: phoneNumber || null,
  }

  if (avatarUrl) {
    profilePayload.avatar_url = avatarUrl
  }

  if (provider) {
    profilePayload.provider = provider
  }

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (upsertError) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set(
      'error',
      encodeURIComponent(upsertError.message || '프로필 동기화에 실패했습니다.')
    )
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  return NextResponse.redirect(new URL(next, origin), { status: 303 })
}