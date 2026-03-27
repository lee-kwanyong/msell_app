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
        background: 'linear-gradient(180deg, #f6f4ef 0%, #f1eee8 100%)',
        color: '#171411',
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '40px 24px 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.55fr) minmax(360px, 0.95fr)',
            gap: 22,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 34,
              background:
                'radial-gradient(circle at top right, rgba(110,84,49,0.08), transparent 28%), linear-gradient(180deg, #fffdfa 0%, #f7f3ec 100%)',
              border: '1px solid rgba(60,42,23,0.08)',
              boxShadow: '0 20px 50px rgba(34,24,16,0.06)',
              padding: 34,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'rgba(58,40,22,0.48)',
                fontWeight: 700,
              }}
            >
              MSELL
            </div>

            <h1
              style={{
                margin: '18px 0 0',
                fontSize: 66,
                lineHeight: 0.95,
                letterSpacing: '-0.055em',
                fontWeight: 700,
                color: '#18130f',
              }}
            >
              디지털 자산
              <br />
              마켓플레이스
            </h1>

            <div
              style={{
                marginTop: 26,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/listings"
                style={{
                  height: 46,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 22px',
                  borderRadius: 999,
                  background: '#24180f',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 10px 24px rgba(36,24,15,0.18)',
                }}
              >
                자산목록
              </Link>

              <Link
                href={user ? '/listings/create' : '/auth/login?next=/listings/create'}
                style={{
                  height: 46,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 22px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.82)',
                  color: '#24180f',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  border: '1px solid rgba(60,42,23,0.10)',
                }}
              >
                자산등록
              </Link>
            </div>

            <div
              style={{
                marginTop: 34,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              <SummaryCard label="현재 공개 자산" value={String(activeCount)} />
              <SummaryCard label="공개 금액 합계" value={`₩ ${formatPrice(totalVisibleAmount)}`} />
              <SummaryCard label="최근 7일 등록" value={String(weekCount)} />
            </div>
          </div>

          <div
            style={{
              borderRadius: 34,
              background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
              border: '1px solid rgba(60,42,23,0.08)',
              boxShadow: '0 20px 50px rgba(34,24,16,0.06)',
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
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: 'rgba(58,40,22,0.48)',
                    fontWeight: 700,
                  }}
                >
                  AMOUNT TREND
                </div>
                <h2
                  style={{
                    margin: '12px 0 0',
                    fontSize: 30,
                    lineHeight: 1.02,
                    letterSpacing: '-0.045em',
                    fontWeight: 700,
                    color: '#171411',
                  }}
                >
                  거래금액 추이
                </h2>
              </div>

              <div
                style={{
                  borderRadius: 999,
                  background: 'rgba(91,66,39,0.05)',
                  color: 'rgba(58,40,22,0.58)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '9px 13px',
                  whiteSpace: 'nowrap',
                }}
              >
                최근 7일
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                borderRadius: 26,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(60,42,23,0.05)',
                padding: 18,
              }}
            >
              <div
                style={{
                  height: 258,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  alignItems: 'end',
                  gap: 12,
                }}
              >
                {amountSeries.map((item) => {
                  const heightPercent =
                    item.amount > 0 ? Math.max((item.amount / maxAmount) * 100, 10) : 6

                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'end',
                        alignItems: 'center',
                        gap: 10,
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 178,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'end',
                        }}
                      >
                        <div
                          title={`${item.label} / ₩ ${formatPrice(item.amount)}`}
                          style={{
                            width: '100%',
                            maxWidth: 50,
                            minHeight: item.amount > 0 ? 18 : 10,
                            height: `${heightPercent}%`,
                            borderRadius: '18px 18px 12px 12px',
                            background:
                              item.amount > 0
                                ? 'linear-gradient(180deg, #5f452b 0%, #24180f 100%)'
                                : 'rgba(36,24,15,0.10)',
                            boxShadow:
                              item.amount > 0 ? '0 12px 26px rgba(36,24,15,0.16)' : 'none',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: 'rgba(52,38,24,0.52)',
                          textAlign: 'center',
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(52,38,24,0.58)',
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
          maxWidth: 1280,
          margin: '0 auto',
          padding: '8px 24px 90px',
        }}
      >
        <div
          style={{
            marginBottom: 18,
            borderRadius: 30,
            background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
            border: '1px solid rgba(60,42,23,0.08)',
            boxShadow: '0 16px 36px rgba(34,24,16,0.05)',
            padding: 26,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.88fr) minmax(0, 1.12fr)',
              gap: 22,
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                borderRadius: 24,
                background: 'rgba(255,255,255,0.68)',
                border: '1px solid rgba(60,42,23,0.05)',
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'rgba(58,40,22,0.48)',
                  fontWeight: 700,
                }}
              >
                POLICY
              </div>
              <h3
                style={{
                  margin: '12px 0 0',
                  fontSize: 28,
                  lineHeight: 1.04,
                  letterSpacing: '-0.045em',
                  fontWeight: 700,
                  color: '#171411',
                }}
              >
                운영 방침
              </h3>

              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  gap: 12,
                }}
              >
                {[
                  '등록 정보는 간결하고 확인 가능한 항목 중심으로 노출',
                  '거래 시작 전 조건과 이전 범위를 반드시 확인',
                  '허위 매물, 중복 등록, 불분명한 정보는 운영 기준에 따라 조정',
                  '문의 이후 진행은 당사자 간 합의를 기준으로 이어짐',
                ].map((text) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      color: 'rgba(32,24,16,0.78)',
                      fontSize: 14,
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: '#5f452b',
                        marginTop: 9,
                        flex: '0 0 auto',
                      }}
                    />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 24,
                background: 'rgba(255,255,255,0.68)',
                border: '1px solid rgba(60,42,23,0.05)',
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'rgba(58,40,22,0.48)',
                  fontWeight: 700,
                }}
              >
                TRADE FLOW
              </div>
              <h3
                style={{
                  margin: '12px 0 0',
                  fontSize: 28,
                  lineHeight: 1.04,
                  letterSpacing: '-0.045em',
                  fontWeight: 700,
                  color: '#171411',
                }}
              >
                거래 진행 4단계
              </h3>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                {[
                  ['01', '매물 확인'],
                  ['02', '거래 문의'],
                  ['03', '조건 협의'],
                  ['04', '이전 완료'],
                ].map(([step, title]) => (
                  <div
                    key={step}
                    style={{
                      borderRadius: 20,
                      background: 'linear-gradient(180deg, #f6f0e7 0%, #fffdfa 100%)',
                      border: '1px solid rgba(60,42,23,0.06)',
                      padding: 18,
                      minHeight: 122,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: 'rgba(58,40,22,0.48)',
                      }}
                    >
                      {step}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.08,
                        letterSpacing: '-0.04em',
                        fontWeight: 700,
                        color: '#171411',
                      }}
                    >
                      {title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 18,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'rgba(58,40,22,0.48)',
                fontWeight: 700,
              }}
            >
              LIVE LISTINGS
            </div>
            <h2
              style={{
                margin: '10px 0 0',
                fontSize: 46,
                lineHeight: 0.98,
                letterSpacing: '-0.055em',
                fontWeight: 700,
                color: '#171411',
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
              background: 'rgba(255,255,255,0.78)',
              color: '#24180f',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
              border: '1px solid rgba(60,42,23,0.10)',
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
                  display: 'block',
                  textDecoration: 'none',
                  color: '#171411',
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
                  border: '1px solid rgba(60,42,23,0.08)',
                  boxShadow: '0 16px 36px rgba(34,24,16,0.05)',
                  padding: 24,
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
                      background: 'rgba(91,66,39,0.06)',
                      color: 'rgba(52,38,24,0.66)',
                      padding: '7px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {item.category || '기타'}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(52,38,24,0.42)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    minHeight: 72,
                    fontSize: 30,
                    lineHeight: 1.14,
                    letterSpacing: '-0.045em',
                    fontWeight: 700,
                    color: '#171411',
                  }}
                >
                  {item.title || '제목 없음'}
                </div>

                <div
                  style={{
                    marginTop: 22,
                    fontSize: 38,
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                    fontWeight: 700,
                    color: '#171411',
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
              borderRadius: 30,
              background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
              border: '1px solid rgba(60,42,23,0.08)',
              boxShadow: '0 16px 36px rgba(34,24,16,0.05)',
              padding: '46px 28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#171411',
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
                  background: '#24180f',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 10px 24px rgba(36,24,15,0.16)',
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 24,
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(60,42,23,0.06)',
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'rgba(52,38,24,0.48)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 38,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          color: '#171411',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  )
}