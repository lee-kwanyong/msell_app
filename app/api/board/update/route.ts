import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  role?: string | null
  is_banned?: boolean | null
}

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function redirectWithError(id: string, message: string) {
  return NextResponse.redirect(
    new URL(`/board/${id}/edit?error=${encodeURIComponent(message)}`, appBaseUrl()),
    { status: 303 }
  )
}

function redirectToDetail(id: string, message: string) {
  return NextResponse.redirect(
    new URL(`/board/${id}?success=${encodeURIComponent(message)}`, appBaseUrl()),
    { status: 303 }
  )
}

export async function POST(req: Request) {
  const supabase = await supabaseServer()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const formData = await req.formData()

  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!id) {
    return NextResponse.redirect(new URL('/board?error=잘못된 요청입니다.', appBaseUrl()), {
      status: 303,
    })
  }

  if (userError) {
    return redirectWithError(id, `사용자 확인 실패: ${userError.message}`)
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=/board/${id}/edit`, appBaseUrl()),
      { status: 303 }
    )
  }

  const [{ data: profile, error: profileError }, { data: rpcIsAdmin, error: rpcError }] =
    await Promise.all([
      supabase.from('profiles').select('role,is_banned').eq('id', user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])

  if (profileError) {
    return redirectWithError(id, `프로필 확인 실패: ${profileError.message}`)
  }

  if (rpcError) {
    return redirectWithError(id, `관리자 권한 확인 실패: ${rpcError.message}`)
  }

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    return redirectWithError(id, '관리자만 공지를 수정할 수 있습니다.')
  }

  if (me?.is_banned) {
    return redirectWithError(id, '차단된 계정은 공지를 수정할 수 없습니다.')
  }

  if (!title || !content) {
    return redirectWithError(id, '제목과 내용을 모두 입력해주세요.')
  }

  const { data: updated, error: updateError } = await supabase
    .from('posts')
    .update({
      title,
      content,
      source: 'notice',
    })
    .eq('id', id)
    .eq('source', 'notice')
    .select('id')
    .single()

  if (updateError) {
    return redirectWithError(id, `공지 수정 실패: ${updateError.message}`)
  }

  if (!updated?.id) {
    return redirectWithError(id, '공지 수정 결과를 확인할 수 없습니다.')
  }

  return redirectToDetail(id, '공지사항이 수정되었습니다.')
}