import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '가격 미정'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return `${numeric.toLocaleString('ko-KR')}원`
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
    case 'pending_review':
      return '검수중'
    case 'reserved':
      return '예약중'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관됨'
    default:
      return status || '상태미정'
  }
}

function getShortDescription(value?: string | null) {
  if (!value) return '설명이 아직 없습니다.'
  const cleaned = value
    .replace(/^\[이전 방식\]\s*.*(\n\n)?/m, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return '설명이 아직 없습니다.'
  return cleaned.length > 90 ? `${cleaned.slice(0, 90)}...` : cleaned
}

export default async function HomePage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .in('status', ['active', 'reserved', 'sold'])
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: myListings } = user
    ? await supabase.from('listings').select('id, status').eq('user_id', user.id)
    : { data: [] as any[] }

  const { data: myDeals } = user
    ? await supabase
        .from('deals')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    : { data: [] as any[] }

  const { data: notifications } = user
    ? await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false)
    : { data: [] as any[] }

  const items = listings ?? []
  const activeListings = items.filter((item) => item.status === 'active').length
  const soldListings = items.filter((item) => item.status === 'sold').length
  const myListingCount = (myListings ?? []).length
  const myDealCount = (myDeals ?? []).length
  const unreadCount = (notifications ?? []).length

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '32px 16px 96px',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'grid',
          gap: 22,
        }}
      >
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.08fr 0.92fr',
            gap: 22,
          }}
          className="msell-home-hero-layout"
        >
          <div
            style={{
              borderRadius: 32,
              padding: 34,
              background:
                'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
              color: '#fffdf8',
              boxShadow: '0 20px 48px rgba(47, 36, 23, 0.14)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 420,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -90,
                right: -90,
                width: 260,
                height: 260,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: -50,
                bottom: -60,
                width: 190,
                height: 190,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'rgba(255,248,236,0.78)',
                  marginBottom: 14,
                }}
              >
                DIGITAL ASSET MARKETPLACE
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 46,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                }}
              >
                자산을 올리고
                <br />
                바로 거래를 시작하세요
              </h1>

              <p
                style={{
                  margin: '18px 0 0',
                  maxWidth: 620,
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: 'rgba(255,248,236,0.82)',
                }}
              >
                Msell은 디지털 자산 거래를 더 빠르고 직관적으로 연결하는 공간입니다.
                목록 확인, 상세 진입, 문의 시작, 거래방 이동까지 한 흐름으로 이어집니다.
              </p>

              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Link href="/listings" style={heroPrimaryLinkStyle}>
                  거래목록 보기
                </Link>
                <Link href="/listings/create" style={heroSecondaryLinkStyle}>
                  자산 등록하기
                </Link>
                {user ? (
                  <Link href="/my/deals" style={heroGhostLinkStyle}>
                    내 거래방
                  </Link>
                ) : (
                  <Link href="/auth/login" style={heroGhostLinkStyle}>
                    로그인
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #eadfcf',
                borderRadius: 28,
                padding: 24,
                boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
                display: 'grid',
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a745b',
                }}
              >
                QUICK STATUS
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                <KpiCard label="현재 자산" value={String(items.length)} />
                <KpiCard label="거래가능" value={String(activeListings)} />
                <KpiCard label="거래종료" value={String(soldListings)} />
                <KpiCard label="읽지 않은 알림" value={String(unreadCount)} />
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #eadfcf',
                borderRadius: 28,
                padding: 24,
                boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a745b',
                }}
              >
                MY FLOW
              </div>

              <InfoRow label="내 자산" value={`${myListingCount}개`} />
              <InfoRow label="내 거래방" value={`${myDealCount}개`} />
              <InfoRow label="권장 시작" value="목록 확인 → 상세 → 문의 시작" />
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 24,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a745b',
                  marginBottom: 8,
                }}
              >
                LATEST LISTINGS
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: '#241b11',
                  fontWeight: 900,
                }}
              >
                최신 등록 자산
              </h2>
            </div>

            <Link href="/listings" style={listMoreLinkStyle}>
              전체 보기
            </Link>
          </div>

          {items.length === 0 ? (
            <div
              style={{
                padding: '28px 20px',
                borderRadius: 22,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
                textAlign: 'center',
                color: '#6a5743',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              아직 등록된 자산이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 14,
              }}
              className="msell-home-listing-grid"
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <article
                    style={{
                      height: '100%',
                      background: '#fbf7f0',
                      border: '1px solid #efe4d5',
                      borderRadius: 22,
                      padding: 16,
                      display: 'grid',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={statusBadgeStyle}>{getStatusLabel(item.status)}</span>
                      {item.category ? (
                        <span style={categoryBadgeStyle}>{item.category}</span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        fontSize: 17,
                        lineHeight: 1.45,
                        fontWeight: 900,
                        color: '#241b11',
                        wordBreak: 'keep-all',
                      }}
                    >
                      {item.title || '제목 없음'}
                    </div>

                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        color: '#2f2417',
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>

                    <div
                      style={{
                        color: '#6a5743',
                        fontSize: 13,
                        lineHeight: 1.7,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {getShortDescription(item.description)}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .msell-home-hero-layout {
            grid-template-columns: 1fr !important;
          }

          .msell-home-listing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 720px) {
          .msell-home-listing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '14px 14px',
        borderRadius: 18,
        background: '#fbf7f0',
        border: '1px solid #efe4d5',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#8a745b',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#241b11',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        padding: '12px 14px',
        borderRadius: 16,
        background: '#fbf7f0',
        border: '1px solid #efe4d5',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#8a745b',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#241b11',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const heroPrimaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 900,
  fontSize: 14,
}

const heroSecondaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  background: '#eadfcf',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const heroGhostLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  color: '#fffaf2',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const listMoreLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
  padding: '0 14px',
  borderRadius: 14,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const statusBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 11,
  fontWeight: 800,
}

const categoryBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: '#f0e5d7',
  color: '#5b4938',
  fontSize: 11,
  fontWeight: 800,
}