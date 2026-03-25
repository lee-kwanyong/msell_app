import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeNextPath(url.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          '로그인 승인 코드가 없습니다. 다시 시도해 주세요.'
        )}&next=${encodeURIComponent(next)}`,
        url.origin
      )
    )
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          '소셜 로그인 세션 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        )}&next=${encodeURIComponent(next)}`,
        url.origin
      )
    )
  }

  return NextResponse.redirect(new URL(next, url.origin))
}