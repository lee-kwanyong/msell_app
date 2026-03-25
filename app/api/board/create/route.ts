import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  role?: string | null
  is_banned?: boolean | null
}

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function redirectWithError(message: string) {
  return NextResponse.redirect(
    new URL(`/board/create?error=${encodeURIComponent(message)}`, appBaseUrl()),
    { status: 303 }
  )
}

function redirectToBoard(message: string) {
  return NextResponse.redirect(
    new URL(`/board?success=${encodeURIComponent(message)}`, appBaseUrl()),
    { status: 303 }
  )
}

export async function POST(req: Request) {
  const supabase = await supabaseServer()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    return redirectWithError(`사용자 확인 실패: ${userError.message}`)
  }

  if (!user) {
    return NextResponse.redirect(
      new URL('/auth/login?next=/board/create', appBaseUrl()),
      { status: 303 }
    )
  }

  const [{ data: profile, error: profileError }, { data: rpcIsAdmin, error: rpcError }] =
    await Promise.all([
      supabase.from('profiles').select('role,is_banned').eq('id', user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])

  if (profileError) {
    return redirectWithError(`프로필 확인 실패: ${profileError.message}`)
  }

  if (rpcError) {
    return redirectWithError(`관리자 권한 확인 실패: ${rpcError.message}`)
  }

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    return redirectWithError('관리자만 공지를 등록할 수 있습니다.')
  }

  if (me?.is_banned) {
    return redirectWithError('차단된 계정은 공지를 등록할 수 없습니다.')
  }

  const formData = await req.formData()

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    return redirectWithError('제목과 내용을 모두 입력해주세요.')
  }

  const { data: inserted, error: insertError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      content,
      source: 'notice',
    })
    .select('id,title,source,created_at')
    .single()

  if (insertError) {
    return redirectWithError(`공지 등록 실패: ${insertError.message}`)
  }

  if (!inserted?.id) {
    return redirectWithError('공지 등록 결과를 확인할 수 없습니다.')
  }

  return redirectToBoard('공지사항이 등록되었습니다.')
}