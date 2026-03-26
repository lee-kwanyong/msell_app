import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type NaverProfileResponse = {
  resultcode?: string
  message?: string
  response?: {
    id?: string
    nickname?: string
    name?: string
    email?: string
    gender?: string
    age?: string
    birthday?: string
    birthyear?: string
    mobile?: string
    profile_image?: string
  }
}

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

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .trim()
}

function makeUsernameCandidate(email: string, fullName: string, fallback: string) {
  const localPart = email.split('@')[0] || ''
  const base = firstString(localPart, fullName, fallback)
  const normalized = normalizeUsername(base)
  return normalized || fallback
}

function mapNaverGender(value: string) {
  if (value === 'M') return 'male'
  if (value === 'F') return 'female'
  return null
}

async function fetchNaverProfile(accessToken: string) {
  const response = await fetch('https://openapi.naver.com/v1/nid/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const json = (await response.json()) as NaverProfileResponse

  if (json.resultcode !== '00' || !json.response) {
    return null
  }

  return json.response
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

  const { data: exchangeData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

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

  const provider = firstString(
    user.app_metadata?.provider,
    metadata.provider,
    identityData?.provider
  )

  let naverProfile: NaverProfileResponse['response'] | null = null

  if (provider === 'custom:naver' || provider === 'naver') {
    const providerToken =
      typeof exchangeData?.session?.provider_token === 'string'
        ? exchangeData.session.provider_token
        : ''

    if (providerToken) {
      try {
        naverProfile = await fetchNaverProfile(providerToken)
      } catch {
        naverProfile = null
      }
    }
  }

  const email = firstString(
    naverProfile?.email,
    user.email,
    metadata.email,
    identityData?.email
  )

  const fullName = firstString(
    naverProfile?.name,
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
    identityData?.username,
    naverProfile?.nickname
  )

  const avatarUrl = firstString(
    naverProfile?.profile_image,
    metadata.avatar_url,
    metadata.picture,
    identityData?.avatar_url,
    identityData?.picture
  )

  const phoneNumber = firstString(
    naverProfile?.mobile,
    user.phone,
    metadata.phone,
    metadata.phone_number,
    identityData?.phone,
    identityData?.phone_number
  )

  const gender = firstString(
    mapNaverGender(firstString(naverProfile?.gender)),
    metadata.gender
  )

  const fallbackUsername = `user_${user.id.slice(0, 8)}`
  const finalUsername = username
    ? makeUsernameCandidate(username, fullName, fallbackUsername)
    : makeUsernameCandidate(email, fullName, fallbackUsername)

  const profilePayload: Record<string, unknown> = {
    id: user.id,
    email: email || null,
    full_name: fullName || null,
    username: finalUsername || null,
    phone_number: phoneNumber || null,
    gender: gender || null,
  }

  if (avatarUrl) {
    profilePayload.avatar_url = avatarUrl
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

  return NextResponse.redirect(new URL('/account', origin), { status: 303 })
}