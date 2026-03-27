'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function toNumber(value: FormDataEntryValue | null) {
  const raw = String(value || '').replace(/,/g, '').trim()
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

  if (['draft', 'pending_review', 'active', 'reserved', 'sold', 'hidden', 'rejected', 'archived'].includes(value)) {
    return value
  }

  return 'active'
}

export async function createListingAction(formData: FormData) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/listings/create')
  }

  const title = cleanText(formData.get('title'))
  const category = cleanText(formData.get('category'))
  const price = toNumber(formData.get('price'))
  const transferMethod = cleanText(formData.get('transfer_method'))
  const description = cleanText(formData.get('description'))
  const status = mapStatus(cleanText(formData.get('status')))

  if (!title || !category || price === null || !transferMethod || !description) {
    redirect('/listings/create?error=' + encodeURIComponent('필수 항목을 모두 입력해 주세요.'))
  }

  const finalDescription = `[이전 방식] ${transferMethod}\n\n${description}`

  const payload: Record<string, unknown> = {
    user_id: user.id,
    title,
    category,
    price,
    description: finalDescription,
    status,
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data?.id) {
    redirect('/listings/create?error=' + encodeURIComponent(error?.message || '등록에 실패했습니다.'))
  }

  redirect(`/listings/${data.id}`)
}