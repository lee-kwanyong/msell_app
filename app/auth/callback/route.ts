import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const loginPath = next.startsWith('/m') ? '/m/auth/login' : '/auth/login'
  const signupPath = next.startsWith('/m') ? '/m/auth/signup' : '/auth/signup'

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
    const message = encodeURIComponent(
      exchangeError.message || 'oauth_callback_failed'
    )
    return NextResponse.redirect(
      new URL(
        `${signupPath}?error=${message}&next=${encodeURIComponent(next)}`,
        requestUrl.origin
      )
    )
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}