import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

const ALLOWED_STATUS = new Set([
  'draft',
  'pending_review',
  'active',
  'reserved',
  'sold',
  'hidden',
  'rejected',
  'archived',
])

function redirectWithError(baseUrl: string, message: string, params: URLSearchParams) {
  const nextParams = new URLSearchParams(params)
  nextParams.set('error', message)
  return NextResponse.redirect(`${baseUrl}?${nextParams.toString()}`, { status: 303 })
}

export async function POST(request: Request) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?next=/listings/create', request.url), {
      status: 303,
    })
  }

  const formData = await request.formData()

  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const transferMethod = String(formData.get('transfer_method') ?? '').trim()
  const descriptionRaw = String(formData.get('description') ?? '').trim()
  const statusRaw = String(formData.get('status') ?? 'active').trim()

  const params = new URLSearchParams({
    title,
    category,
    price: priceRaw,
    transfer_method: transferMethod,
    description: descriptionRaw,
    status: statusRaw || 'active',
  })

  const createPageUrl = new URL('/listings/create', request.url)

  if (!title || !category || !priceRaw || !transferMethod || !descriptionRaw) {
    return redirectWithError(createPageUrl.toString().split('?')[0], '필수 항목을 모두 입력해 주세요.', params)
  }

  const price = Number(priceRaw)

  if (!Number.isFinite(price) || price < 0) {
    return redirectWithError(createPageUrl.toString().split('?')[0], '희망 가격 형식이 올바르지 않습니다.', params)
  }

  const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : 'active'
  const description = `[이전 방식] ${transferMethod}\n\n${descriptionRaw}`

  const insertPayload = {
    user_id: user.id,
    title,
    category,
    price,
    description,
    status,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error || !data?.id) {
    return redirectWithError(
      createPageUrl.toString().split('?')[0],
      error?.message || '자산 등록에 실패했습니다.',
      params,
    )
  }

  return NextResponse.redirect(new URL(`/listings/${data.id}`, request.url), { status: 303 })
}