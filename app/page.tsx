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
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        color: '#111111',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '32px 20px 18px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(360px, 0.95fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              borderRadius: 32,
              background: '#ffffff',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
              padding: 32,
            }}
          >
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.2,
                letterSpacing: '0.14em',
                color: 'rgba(17,17,17,0.45)',
                fontWeight: 600,
              }}
            >
              MSELL
            </div>

            <h1
              style={{
                marginTop: 18,
                fontSize: 64,
                lineHeight: 0.98,
                letterSpacing: '-0.05em',
                fontWeight: 700,
                marginBottom: 0,
              }}
            >
              디지털 자산 거래
            </h1>

            <div
              style={{
                marginTop: 28,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/listings"
                style={{
                  height: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  borderRadius: 999,
                  background: '#111111',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                자산목록
              </Link>

              <Link
                href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                style={{
                  height: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#111111',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid rgba(17,17,17,0.10)',
                }}
              >
                자산등록
              </Link>
            </div>

            <div
              style={{
                marginTop: 30,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 24,
                  background: '#f7f7f8',
                  padding: 22,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(17,17,17,0.48)',
                  }}
                >
                  현재 공개 자산
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {activeCount}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: '#f7f7f8',
                  padding: 22,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(17,17,17,0.48)',
                  }}
                >
                  공개 금액 합계
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  ₩ {formatPrice(totalVisibleAmount)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: '#f7f7f8',
                  padding: 22,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(17,17,17,0.48)',
                  }}
                >
                  최근 7일 등록
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {weekCount}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 32,
              background: '#ffffff',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.2,
                    letterSpacing: '0.14em',
                    color: 'rgba(17,17,17,0.45)',
                    fontWeight: 600,
                  }}
                >
                  AMOUNT TREND
                </div>
                <h2
                  style={{
                    marginTop: 12,
                    marginBottom: 0,
                    fontSize: 32,
                    lineHeight: 1.05,
                    letterSpacing: '-0.04em',
                    fontWeight: 700,
                  }}
                >
                  거래금액 추이
                </h2>
              </div>

              <div
                style={{
                  borderRadius: 999,
                  background: '#f7f7f8',
                  padding: '10px 14px',
                  fontSize: 12,
                  color: 'rgba(17,17,17,0.55)',
                  whiteSpace: 'nowrap',
                }}
              >
                최근 7일
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                borderRadius: 24,
                background: '#f7f7f8',
                padding: 18,
              }}
            >
              <div
                style={{
                  height: 240,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  alignItems: 'end',
                  gap: 14,
                }}
              >
                {amountSeries.map((item) => {
                  const heightPercent =
                    item.amount > 0 ? Math.max((item.amount / maxAmount) * 100, 8) : 6

                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'end',
                        gap: 10,
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          height: 170,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'end',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          title={`${item.label} / ₩ ${formatPrice(item.amount)}`}
                          style={{
                            width: '100%',
                            maxWidth: 54,
                            height: `${heightPercent}%`,
                            minHeight: item.amount > 0 ? 16 : 10,
                            borderRadius: '18px 18px 10px 10px',
                            background:
                              item.amount > 0
                                ? 'linear-gradient(180deg, #1f7aff 0%, #0a66e8 100%)'
                                : 'rgba(17,17,17,0.10)',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: 'rgba(17,17,17,0.48)',
                          textAlign: 'center',
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(17,17,17,0.55)',
                          textAlign: 'center',
                          lineHeight: 1.35,
                          wordBreak: 'break-all',
                        }}
                      >
                        {item.amount > 0 ? `₩${formatPrice(item.amount)}` : '-'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '8px 20px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.2,
                letterSpacing: '0.14em',
                color: 'rgba(17,17,17,0.45)',
                fontWeight: 600,
              }}
            >
              LIVE LISTINGS
            </div>
            <h2
              style={{
                marginTop: 10,
                marginBottom: 0,
                fontSize: 42,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                fontWeight: 700,
              }}
            >
              최신 등록 자산
            </h2>
          </div>

          <Link
            href="/listings"
            style={{
              height: 42,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 18px',
              borderRadius: 999,
              background: '#ffffff',
              color: '#111111',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid rgba(17,17,17,0.10)',
              whiteSpace: 'nowrap',
            }}
          >
            전체 자산 보기
          </Link>
        </div>

        {latestListings.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 18,
            }}
          >
            {latestListings.map((item) => (
              <Link
                key={item.id || `${item.title}-${item.created_at}`}
                href={item.id ? `/listings/${item.id}` : '/listings'}
                style={{
                  textDecoration: 'none',
                  color: '#111111',
                  borderRadius: 28,
                  background: '#ffffff',
                  border: '1px solid rgba(17,17,17,0.06)',
                  boxShadow: '0 14px 30px rgba(0,0,0,0.04)',
                  padding: 24,
                  display: 'block',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderRadius: 999,
                      background: '#f7f7f8',
                      padding: '7px 12px',
                      fontSize: 12,
                      color: 'rgba(17,17,17,0.60)',
                    }}
                  >
                    {item.category || '기타'}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(17,17,17,0.42)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 30,
                    lineHeight: 1.15,
                    letterSpacing: '-0.04em',
                    fontWeight: 700,
                    minHeight: 70,
                  }}
                >
                  {item.title || '제목 없음'}
                </div>

                <div
                  style={{
                    marginTop: 20,
                    fontSize: 36,
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                    fontWeight: 700,
                  }}
                >
                  ₩ {formatPrice(toNumber(item.price))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              borderRadius: 28,
              background: '#ffffff',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 14px 30px rgba(0,0,0,0.04)',
              padding: '44px 28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              등록된 자산이 없습니다
            </div>

            <div style={{ marginTop: 20 }}>
              <Link
                href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                style={{
                  height: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  borderRadius: 999,
                  background: '#111111',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                }}
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