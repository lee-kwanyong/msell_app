import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

function toNumber(value: FormDataEntryValue | null) {
  const raw = String(value || '')
    .replace(/,/g, '')
    .trim()

  if (!raw) return null

  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || '').trim()
}

function mapStatus(input: string) {
  const value = input.trim()

  if (value === '거래가능') return 'active'
  if (value === '임시저장') return 'draft'
  if (value === '숨김') return 'hidden'
  if (value === '거래종료') return 'sold'

  if (
    [
      'draft',
      'pending_review',
      'active',
      'reserved',
      'sold',
      'hidden',
      'rejected',
      'archived',
    ].includes(value)
  ) {
    return value
  }

  return 'active'
}

function buildRedirectUrl(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/listings/create', request.url)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url
}

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer()
  const formData = await request.formData()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(new URL('/auth/login?next=/listings/create', request.url), 303)
  }

  const title = cleanText(formData.get('title'))
  const category = cleanText(formData.get('category'))
  const price = toNumber(formData.get('price'))
  const priceNegotiable = cleanText(formData.get('price_negotiable')) === 'true'
  const transferMethod = cleanText(formData.get('transfer_method'))
  const description = cleanText(formData.get('description'))
  const status = mapStatus(cleanText(formData.get('status')))

  if (!title || !category || price === null || !transferMethod || !description) {
    return NextResponse.redirect(
      buildRedirectUrl(request, {
        error: '필수 항목을 모두 입력해 주세요.',
        title,
        category,
        price: price === null ? '' : String(price),
        price_negotiable: String(priceNegotiable),
        transfer_method: transferMethod,
        description,
        status,
      }),
      303
    )
  }

  const finalDescription = `[이전 방식] ${transferMethod}\n\n${description}`

  const payload: Record<string, unknown> = {
    seller_id: user.id,
    title,
    category,
    price,
    price_negotiable: priceNegotiable,
    description: finalDescription,
    status,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data?.id) {
    return NextResponse.redirect(
      buildRedirectUrl(request, {
        error: error?.message || '등록에 실패했습니다.',
        title,
        category,
        price: String(price),
        price_negotiable: String(priceNegotiable),
        transfer_method: transferMethod,
        description,
        status,
      }),
      303
    )
  }

  return NextResponse.redirect(new URL(`/listings/${data.id}`, request.url), 303)
}