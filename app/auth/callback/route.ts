import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

function buildLoginRedirect(origin: string, next: string, message: string) {
  return NextResponse.redirect(
    new URL(
      `/auth/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`,
      origin
    )
  )
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeNextPath(url.searchParams.get('next'))

  const oauthError = url.searchParams.get('error')
  const oauthErrorCode = url.searchParams.get('error_code')
  const oauthErrorDescription = url.searchParams.get('error_description')

  if (oauthError) {
    const message = [
      '소셜 로그인 처리 중 오류가 발생했습니다.',
      oauthErrorCode ? `error_code: ${oauthErrorCode}` : '',
      oauthErrorDescription ? `detail: ${oauthErrorDescription}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    return buildLoginRedirect(url.origin, next, message)
  }

  if (!code) {
    return buildLoginRedirect(
      url.origin,
      next,
      '로그인 승인 코드가 없습니다. 다시 시도해 주세요.'
    )
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return buildLoginRedirect(
      url.origin,
      next,
      `소셜 로그인 세션 처리 중 오류가 발생했습니다.\n${error.message}`
    )
  }

  return NextResponse.redirect(new URL(next, url.origin))
}