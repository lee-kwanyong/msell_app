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

function formatPrice(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
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
    const key = `${yyyy}-${mm}-${dd}`

    days.push({
      key,
      label: formatDayLabel(d),
      amount: 0,
    })
  }

  for (const row of rows) {
    const createdAt = row.created_at ? new Date(row.created_at) : null
    if (!createdAt || Number.isNaN(createdAt.getTime())) continue

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

function buildPath(values: number[], width: number, height: number) {
  if (values.length === 0) return ''
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - ((value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function buildAreaPath(linePath: string, width: number, height: number) {
  if (!linePath) return ''
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

function getCategoryBadge(category?: string | null) {
  const value = (category || '').trim()
  if (!value) return '기타'
  return value
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
      return status || '상태확인'
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listingsRaw } = await supabase
    .from('listings')
    .select('id, title, category, price, status, created_at')
    .order('created_at', { ascending: false })
    .limit(60)

  const listings: ListingRow[] = Array.isArray(listingsRaw) ? listingsRaw : []

  const publicListings = listings.filter((item) =>
    ['active', 'sold', 'reserved'].includes(String(item.status || ''))
  )

  const liveListings = listings.filter((item) => String(item.status || '') === 'active')
  const latestListings = liveListings.slice(0, 6)

  const amountSeries = buildAmountSeries(publicListings)
  const chartValues = amountSeries.map((item) => item.amount)
  const linePath = buildPath(chartValues, 100, 44)
  const areaPath = buildAreaPath(linePath, 100, 44)

  const totalLiveCount = liveListings.length
  const totalLiveAmount = liveListings.reduce((sum, item) => sum + toNumber(item.price), 0)
  const recentRegisteredCount = listings.filter((item) => {
    if (!item.created_at) return false
    const diff = Date.now() - new Date(item.created_at).getTime()
    return diff <= 1000 * 60 * 60 * 24 * 7
  }).length

  const highestPrice = liveListings.reduce((max, item) => {
    const price = toNumber(item.price)
    return Math.max(max, price)
  }, 0)

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <section className="mx-auto w-full max-w-[1280px] px-5 pb-12 pt-8 md:px-8 md:pb-20 md:pt-10">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="overflow-hidden rounded-[36px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(0,113,227,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-6 py-8 md:px-10 md:py-10">
              <div className="inline-flex items-center rounded-full border border-black/6 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-black/55">
                MSELL · DIGITAL ASSET MARKET
              </div>

              <h1 className="mt-5 max-w-[780px] text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#111111] md:text-[72px]">
                디지털 자산 거래를
                <br />
                더 단순하게,
                <br />
                더 선명하게.
              </h1>

              <p className="mt-6 max-w-[760px] text-[16px] leading-8 text-black/62 md:text-[18px]">
                계정, 채널, 사이트, 도메인, 소프트웨어 같은 디지털 자산을 등록하고,
                문의와 거래 흐름을 한 화면 안에서 자연스럽게 이어가도록 구성했습니다.
                홈에서는 현재 등록 흐름과 금액 추이를 바로 확인할 수 있습니다.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/listings"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-6 text-[15px] font-semibold text-white transition hover:bg-black"
                >
                  자산 둘러보기
                </Link>

                <Link
                  href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[15px] font-semibold text-[#111111] transition hover:bg-[#f2f2f4]"
                >
                  자산 등록하기
                </Link>
              </div>

              <div className="mt-9 grid gap-3 md:grid-cols-3">
                <div className="rounded-[28px] border border-black/6 bg-white/80 p-5 backdrop-blur">
                  <div className="text-[12px] font-medium text-black/45">현재 공개 자산</div>
                  <div className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#111111]">
                    {totalLiveCount}건
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-black/48">
                    거래 가능한 상태의 자산만 기준으로 집계합니다.
                  </p>
                </div>

                <div className="rounded-[28px] border border-black/6 bg-white/80 p-5 backdrop-blur">
                  <div className="text-[12px] font-medium text-black/45">공개 자산 금액 합계</div>
                  <div className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#111111]">
                    ₩ {formatPrice(totalLiveAmount)}
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-black/48">
                    현재 노출 중인 자산의 희망 가격 합계입니다.
                  </p>
                </div>

                <div className="rounded-[28px] border border-black/6 bg-white/80 p-5 backdrop-blur">
                  <div className="text-[12px] font-medium text-black/45">최근 7일 등록</div>
                  <div className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#111111]">
                    {recentRegisteredCount}건
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-black/48">
                    최근 일주일 안에 새로 올라온 자산 수입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[12px] font-semibold tracking-[0.16em] text-black/40">
                    AMOUNT TREND
                  </div>
                  <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#111111]">
                    거래금액 추이
                  </h2>
                  <p className="mt-2 text-[14px] leading-7 text-black/56">
                    현재는 등록된 자산의 희망 가격 기준으로 7일 추이를 표시합니다.
                  </p>
                </div>

                <div className="rounded-[22px] bg-[#f5f5f7] px-4 py-3 text-right">
                  <div className="text-[11px] text-black/40">최고 등록 금액</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#111111]">
                    ₩ {formatPrice(highestPrice)}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] bg-[linear-gradient(180deg,#fbfbfd_0%,#f6f7fb_100%)] p-4">
                <div className="h-[220px] w-full rounded-[24px] border border-black/5 bg-white px-4 py-4">
                  <svg
                    viewBox="0 0 100 52"
                    preserveAspectRatio="none"
                    className="h-[170px] w-full"
                    aria-label="금액 추이 그래프"
                  >
                    <defs>
                      <linearGradient id="amountAreaFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(0,113,227,0.22)" />
                        <stop offset="100%" stopColor="rgba(0,113,227,0.02)" />
                      </linearGradient>
                    </defs>

                    {[0, 1, 2, 3].map((line) => {
                      const y = 10 + line * 12
                      return (
                        <line
                          key={line}
                          x1="0"
                          y1={y}
                          x2="100"
                          y2={y}
                          stroke="rgba(0,0,0,0.08)"
                          strokeWidth="0.6"
                          strokeDasharray="1.5 2"
                        />
                      )
                    })}

                    {areaPath ? <path d={areaPath} fill="url(#amountAreaFill)" /> : null}

                    {linePath ? (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="rgba(0,113,227,0.95)"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ) : null}

                    {chartValues.map((value, index) => {
                      const max = Math.max(...chartValues, 1)
                      const min = Math.min(...chartValues, 0)
                      const range = Math.max(max - min, 1)
                      const x = (index / Math.max(chartValues.length - 1, 1)) * 100
                      const y = 44 - ((value - min) / range) * 44

                      return (
                        <circle
                          key={`${amountSeries[index]?.key ?? index}-dot`}
                          cx={x}
                          cy={y}
                          r="1.6"
                          fill="rgba(0,113,227,1)"
                        />
                      )
                    })}
                  </svg>

                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {amountSeries.map((item) => (
                      <div key={item.key} className="min-w-0">
                        <div className="text-[11px] text-black/38">{item.label}</div>
                        <div className="mt-1 truncate text-[12px] font-medium text-black/58">
                          {item.amount > 0 ? `₩${formatPrice(item.amount)}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-7">
              <div className="text-[12px] font-semibold tracking-[0.16em] text-black/40">
                FLOW
              </div>
              <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[#111111]">
                홈에서 바로 이어지는 흐름
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  ['1', '자산 등록', '제목, 카테고리, 가격, 설명만 정확하게 입력'],
                  ['2', '문의 시작', '관심 있는 자산에서 바로 거래 문의 시작'],
                  ['3', '진행 관리', '내 거래와 내 자산 화면에서 흐름 이어가기'],
                ].map(([step, title, desc]) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-[24px] bg-[#f5f5f7] px-4 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                      {step}
                    </div>
                    <div>
                      <div className="text-[16px] font-semibold text-[#111111]">{title}</div>
                      <p className="mt-1 text-[13px] leading-6 text-black/56">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 pb-16 md:px-8 md:pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-semibold tracking-[0.16em] text-black/40">
              LIVE LISTINGS
            </div>
            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.05em] text-[#111111]">
              최신 등록 자산
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-black/56">
              거래가능 상태 자산을 최신순으로 노출합니다.
            </p>
          </div>

          <Link
            href="/listings"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/8 bg-white px-5 text-[14px] font-semibold text-[#111111] transition hover:bg-[#f2f2f4]"
          >
            전체 자산 보기
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {latestListings.length > 0 ? (
            latestListings.map((item) => (
              <Link
                key={item.id || `${item.title}-${item.created_at}`}
                href={item.id ? `/listings/${item.id}` : '/listings'}
                className="group rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_22px_50px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-black/58">
                    {getCategoryBadge(item.category)}
                  </div>
                  <div className="text-[12px] text-black/36">{getStatusLabel(item.status)}</div>
                </div>

                <h3 className="mt-5 line-clamp-2 text-[25px] font-semibold leading-[1.18] tracking-[-0.04em] text-[#111111]">
                  {item.title || '제목 미입력'}
                </h3>

                <div className="mt-6 text-[30px] font-semibold tracking-[-0.05em] text-[#111111]">
                  ₩ {formatPrice(toNumber(item.price))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[13px] text-black/46">상세 페이지로 이동</span>
                  <span className="text-[18px] text-black/28 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="lg:col-span-3 rounded-[32px] border border-dashed border-black/10 bg-white px-6 py-14 text-center shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
              <div className="text-[30px] font-semibold tracking-[-0.04em] text-[#111111]">
                아직 등록된 자산이 없습니다.
              </div>
              <p className="mt-3 text-[15px] leading-7 text-black/56">
                첫 자산을 등록하면 홈의 최신 자산과 금액 추이 영역이 함께 반영됩니다.
              </p>
              <div className="mt-6">
                <Link
                  href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-6 text-[15px] font-semibold text-white transition hover:bg-black"
                >
                  첫 자산 등록하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}