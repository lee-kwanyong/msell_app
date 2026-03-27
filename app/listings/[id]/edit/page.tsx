import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryDropdown from '@/components/listings/CategoryDropdown'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    error?: string
  }>
}

function parseTransferMethod(description: string | null) {
  const text = description || ''

  if (!text.startsWith('[이전 방식] ')) {
    return {
      transferMethod: '',
      plainDescription: text,
    }
  }

  const withoutPrefix = text.replace('[이전 방식] ', '')
  const [firstLine, ...rest] = withoutPrefix.split('\n')
  const plainDescription = rest.join('\n').trim()

  return {
    transferMethod: firstLine.trim(),
    plainDescription,
  }
}

export default async function ListingEditPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) || {}
  const error = resolvedSearchParams.error || ''

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/listings/${id}/edit`)
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, user_id, title, category, price, description, status')
    .eq('id', id)
    .single()

  if (listingError || !listing) {
    notFound()
  }

  if (listing.user_id !== user.id) {
    redirect(`/listings/${id}`)
  }

  const { transferMethod, plainDescription } = parseTransferMethod(listing.description)

  return (
    <main className="min-h-screen bg-[#f6f1e7] px-4 py-8 text-[#20170f]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a7357]">
              MSELL
            </p>
            <h1 className="mt-2 text-[30px] font-semibold leading-tight text-[#1f160f]">
              자산 수정
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#6e5c4b]">
              등록한 자산 정보를 현재 상태에 맞게 수정하세요.
            </p>
          </div>

          <Link
            href={`/listings/${id}`}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#d9ccb8] bg-white px-4 text-[14px] font-semibold text-[#2f2417] transition hover:bg-[#f8f3eb]"
          >
            상세로
          </Link>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-[#efc9c9] bg-[#fff5f5] px-4 py-3 text-[14px] text-[#9d2f2f]">
            {error}
          </div>
        ) : null}

        <form
          action={`/api/listings/update`}
          method="post"
          className="rounded-[30px] border border-[#e6dbc8] bg-white p-5 shadow-[0_20px_60px_rgba(47,36,23,0.08)] md:p-7"
        >
          <input type="hidden" name="id" value={listing.id} />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                제목
              </label>
              <input
                name="title"
                type="text"
                defaultValue={listing.title || ''}
                placeholder="예: 수익화 완료 유튜브 채널"
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                카테고리
              </label>
              <CategoryDropdown
                name="category"
                defaultValue={typeof listing.category === 'string' ? listing.category : ''}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                희망 가격
              </label>
              <input
                name="price"
                type="number"
                inputMode="numeric"
                defaultValue={listing.price ?? ''}
                placeholder="예: 1500000"
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                이전 방식
              </label>
              <input
                name="transfer_method"
                type="text"
                defaultValue={transferMethod}
                placeholder="예: 계정 이메일 양도 / 관리자 권한 이전 / 도메인 이전"
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                설명
              </label>
              <textarea
                name="description"
                rows={8}
                defaultValue={plainDescription}
                placeholder="운영 기간, 수익 구조, 팔로워/구독자 상태, 인수인계 범위를 구체적으로 적어 주세요."
                className="w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 py-3 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                상태
              </label>
              <select
                name="status"
                defaultValue={listing.status || 'active'}
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
              >
                <option value="active">거래가능</option>
                <option value="draft">임시저장</option>
                <option value="hidden">숨김</option>
                <option value="sold">거래종료</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2f2417] px-5 text-[15px] font-semibold text-white transition hover:bg-[#241b11]"
            >
              수정 저장
            </button>

            <Link
              href={`/listings/${id}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#d9ccb8] bg-[#f8f3eb] px-5 text-[15px] font-semibold text-[#2f2417] transition hover:bg-[#efe6d8]"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}