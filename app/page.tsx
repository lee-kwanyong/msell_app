import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

type ListingRow = {
  id?: string
  title?: string | null
  category?: string | null
  price?: number | string | null
  status?: string | null
  created_at?: string | null
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : 0
  }
  return 0
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDayLabel(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function buildAmountSeries(rows: ListingRow[]) {
  const today = new Date()
  const days: { key: string; label: string; amount: number }[] = []

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(today.getDate() - i)

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    days.push({
      key: `${yyyy}-${mm}-${dd}`,
      label: formatDayLabel(d),
      amount: 0,
    })
  }

  for (const row of rows) {
    if (!row.created_at) continue

    const createdAt = new Date(row.created_at)
    if (Number.isNaN(createdAt.getTime())) continue

    const yyyy = createdAt.getFullYear()
    const mm = String(createdAt.getMonth() + 1).padStart(2, '0')
    const dd = String(createdAt.getDate()).padStart(2, '0')
    const key = `${yyyy}-${mm}-${dd}`

    const target = days.find((day) => day.key === key)
    if (!target) continue

    target.amount += toNumber(row.price)
  }

  return days
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'draft':
      return '임시저장'
    case 'hidden':
      return '숨김'
    case 'sold':
      return '거래종료'
    case 'reserved':
      return '예약중'
    case 'pending_review':
      return '검토중'
    default:
      return '상태확인'
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('listings')
    .select('id, title, category, price, status, created_at')
    .order('created_at', { ascending: false })
    .limit(60)

  const listings: ListingRow[] = Array.isArray(data) ? data : []

  const visibleListings = listings.filter((item) =>
    ['active', 'reserved', 'sold'].includes(String(item.status || ''))
  )
  const activeListings = listings.filter((item) => String(item.status || '') === 'active')
  const latestListings = activeListings.slice(0, 6)

  const amountSeries = buildAmountSeries(visibleListings)
  const maxAmount = Math.max(...amountSeries.map((item) => item.amount), 1)

  const activeCount = activeListings.length
  const totalVisibleAmount = visibleListings.reduce((sum, item) => sum + toNumber(item.price), 0)
  const weekCount = listings.filter((item) => {
    if (!item.created_at) return false
    const createdAt = new Date(item.created_at).getTime()
    if (!Number.isFinite(createdAt)) return false
    return Date.now() - createdAt <= 1000 * 60 * 60 * 24 * 7
  }).length

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#111111]">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="text-[12px] font-medium tracking-[0.14em] text-black/45">
              MSELL
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-black md:text-6xl">
              디지털 자산 거래
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/listings"
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                자산목록
              </Link>

              <Link
                href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
              >
                자산등록
              </Link>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-[#f7f7f8] p-5">
                <div className="text-xs text-black/45">현재 공개 자산</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  {activeCount}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#f7f7f8] p-5">
                <div className="text-xs text-black/45">공개 금액 합계</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  ₩ {formatPrice(totalVisibleAmount)}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#f7f7f8] p-5">
                <div className="text-xs text-black/45">최근 7일 등록</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  {weekCount}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium tracking-[0.14em] text-black/45">
                  AMOUNT TREND
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
                  거래금액 추이
                </h2>
              </div>

              <div className="rounded-full bg-[#f7f7f8] px-3 py-2 text-xs text-black/55">
                최근 7일
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-[#f7f7f8] p-4">
              <div className="flex h-52 items-end gap-3">
                {amountSeries.map((item) => {
                  const heightPercent = item.amount > 0 ? Math.max((item.amount / maxAmount) * 100, 8) : 6

                  return (
                    <div key={item.key} className="flex flex-1 flex-col items-center justify-end gap-3">
                      <div className="flex h-40 w-full items-end justify-center">
                        <div
                          className="w-full max-w-[56px] rounded-t-[18px] bg-black"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label} / ₩ ${formatPrice(item.amount)}`}
                        />
                      </div>
                      <div className="text-xs text-black/45">{item.label}</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {amountSeries.map((item) => (
                  <div key={`${item.key}-value`} className="truncate text-center text-xs text-black/55">
                    {item.amount > 0 ? `₩${formatPrice(item.amount)}` : '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-medium tracking-[0.14em] text-black/45">
              LIVE LISTINGS
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black md:text-4xl">
              최신 등록 자산
            </h2>
          </div>

          <Link
            href="/listings"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
          >
            전체 자산 보기
          </Link>
        </div>

        {latestListings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestListings.map((item) => (
              <Link
                key={item.id || `${item.title}-${item.created_at}`}
                href={item.id ? `/listings/${item.id}` : '/listings'}
                className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate rounded-full bg-[#f7f7f8] px-3 py-1 text-xs text-black/60">
                    {item.category || '기타'}
                  </div>
                  <div className="text-xs text-black/40">{getStatusLabel(item.status)}</div>
                </div>

                <div className="mt-5 line-clamp-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                  {item.title || '제목 없음'}
                </div>

                <div className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-black">
                  ₩ {formatPrice(toNumber(item.price))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-black/5 bg-white p-10 text-center shadow-sm">
            <div className="text-xl font-semibold tracking-[-0.03em] text-black">
              등록된 자산이 없습니다
            </div>
            <div className="mt-5">
              <Link
                href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                자산등록
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}