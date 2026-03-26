import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

function safePath(input: string | null | undefined, fallback: string) {
  if (!input) return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//')) return fallback
  return input
}

function buildUrl(origin: string, path: string, params?: Record<string, string>) {
  const url = new URL(path, origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  return url
}

function parsePrice(value: string) {
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(numeric) || numeric < 0) return null
  return numeric
}

function buildDescription(description: string, transferMethod: string) {
  const cleanDescription = description.trim()
  const cleanTransferMethod = transferMethod.trim()

  if (!cleanTransferMethod) return cleanDescription
  if (!cleanDescription) return `[이전 방식] ${cleanTransferMethod}`

  return `[이전 방식] ${cleanTransferMethod}\n\n${cleanDescription}`
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const formData = await request.formData()

  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const transferMethod = String(formData.get('transfer_method') ?? '').trim()
  const descriptionRaw = String(formData.get('description') ?? '').trim()
  const statusRaw = String(formData.get('status') ?? 'active').trim()

  const errorReturnTo = safePath(
    String(formData.get('error_return_to') ?? formData.get('return_to') ?? '/listings/create'),
    '/listings/create'
  )

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      buildUrl(origin, '/auth/login', { next: errorReturnTo }).toString(),
      { status: 303 }
    )
  }

  if (!title) {
    return NextResponse.redirect(
      buildUrl(origin, errorReturnTo, {
        error: '제목을 입력해 주세요.',
      }).toString(),
      { status: 303 }
    )
  }

  if (!category) {
    return NextResponse.redirect(
      buildUrl(origin, errorReturnTo, {
        error: '카테고리를 선택해 주세요.',
      }).toString(),
      { status: 303 }
    )
  }

  const price = parsePrice(priceRaw)
  if (priceRaw && price === null) {
    return NextResponse.redirect(
      buildUrl(origin, errorReturnTo, {
        error: '가격 형식이 올바르지 않습니다.',
      }).toString(),
      { status: 303 }
    )
  }

  const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : 'active'
  const description = buildDescription(descriptionRaw, transferMethod)

  const payload: Record<string, any> = {
    user_id: user.id,
    title,
    category,
    status,
    description,
  }

  if (price !== null) {
    payload.price = price
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data?.id) {
    return NextResponse.redirect(
      buildUrl(origin, errorReturnTo, {
        error: error?.message || '자산 등록에 실패했습니다.',
      }).toString(),
      { status: 303 }
    )
  }

  return NextResponse.redirect(
    buildUrl(origin, `/listings/${data.id}`, {
      success: '자산이 등록되었습니다.',
    }).toString(),
    { status: 303 }
  )
}