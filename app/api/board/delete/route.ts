import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  role?: string | null
  is_banned?: boolean | null
}

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function redirectToDetail(id: string, message: string) {
  return NextResponse.redirect(
    new URL(`/board/${id}?error=${encodeURIComponent(message)}`, appBaseUrl()),
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

  const formData = await req.formData()
  const id = String(formData.get('id') ?? '').trim()

  if (!id) {
    return NextResponse.redirect(new URL('/board?error=잘못된 요청입니다.', appBaseUrl()), {
      status: 303,
    })
  }

  if (userError) {
    return redirectToDetail(id, `사용자 확인 실패: ${userError.message}`)
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=/board/${id}`, appBaseUrl()),
      { status: 303 }
    )
  }

  const [{ data: profile, error: profileError }, { data: rpcIsAdmin, error: rpcError }] =
    await Promise.all([
      supabase.from('profiles').select('role,is_banned').eq('id', user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])

  if (profileError) {
    return redirectToDetail(id, `프로필 확인 실패: ${profileError.message}`)
  }

  if (rpcError) {
    return redirectToDetail(id, `관리자 권한 확인 실패: ${rpcError.message}`)
  }

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    return redirectToDetail(id, '관리자만 공지를 삭제할 수 있습니다.')
  }

  if (me?.is_banned) {
    return redirectToDetail(id, '차단된 계정은 공지를 삭제할 수 없습니다.')
  }

  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('source', 'notice')

  if (deleteError) {
    return redirectToDetail(id, `공지 삭제 실패: ${deleteError.message}`)
  }

  return redirectToBoard('공지사항이 삭제되었습니다.')
}