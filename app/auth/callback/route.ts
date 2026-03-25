import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          errorDescription || error
        )}&next=${encodeURIComponent(safeNext)}`,
        origin
      ),
      { status: 303 }
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          '로그인 인증 코드가 없습니다.'
        )}&next=${encodeURIComponent(safeNext)}`,
        origin
      ),
      { status: 303 }
    )
  }

  const supabase = await supabaseServer()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  )

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          exchangeError.message
        )}&next=${encodeURIComponent(safeNext)}`,
        origin
      ),
      { status: 303 }
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      const meta = user.user_metadata ?? {}

      const full_name =
        String(
          meta.full_name ||
            meta.name ||
            meta.user_name ||
            meta.nickname ||
            ''
        ).trim() || null

      const username =
        String(meta.preferred_username || meta.user_name || '').trim() || null

      const phone_number =
        String(user.phone || meta.phone || '').trim() || null

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? null,
          full_name,
          username,
          phone_number,
        },
        { onConflict: 'id' }
      )
    } else {
      await supabase
        .from('profiles')
        .update({
          email: user.email ?? null,
          phone_number: user.phone ?? null,
        })
        .eq('id', user.id)
    }
  }

  return NextResponse.redirect(new URL(safeNext, origin), {
    status: 303,
  })
}