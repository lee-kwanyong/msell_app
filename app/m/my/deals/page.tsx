import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '가격 미정'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return `${numeric.toLocaleString('ko-KR')}원`
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MobileMyDealsPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/m/auth/login?next=/m/my/deals')
  }

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  const dealItems = deals ?? []
  const listingIds = Array.from(
    new Set(
      dealItems
        .map((item) => item.listing_id)
        .filter(Boolean)
    )
  )

  let listingsMap = new Map<string, any>()
  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds)

    listingsMap = new Map((listings ?? []).map((item) => [String(item.id), item]))
  }

  let unreadMap = new Map<string, number>()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('deal_id, is_read')
    .eq('user_id', user.id)
    .eq('is_read', false)

  for (const item of notifications ?? []) {
    const dealId = String(item.deal_id ?? '')
    if (!dealId) continue
    unreadMap.set(dealId, (unreadMap.get(dealId) || 0) + 1)
  }

  const totalCount = dealItems.length
  const unreadTotal = Array.from(unreadMap.values()).reduce((a, b) => a + b, 0)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '18px 14px 120px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          style={{
            borderRadius: 24,
            padding: 22,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255,248,236,0.78)',
              marginBottom: 8,
            }}
          >
            MY DEAL ROOMS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.18,
              fontWeight: 900,
            }}
          >
            내 거래방
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255,248,236,0.82)',
            }}
          >
            진행 중인 대화방과 최근 업데이트를 한 화면에서 빠르게 확인할 수 있게 정리했습니다.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            <MetricCard label="전체 거래방" value={String(totalCount)} />
            <MetricCard label="읽지 않은 알림" value={String(unreadTotal)} />
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/m/listings" style={secondaryTopLinkStyle}>
            거래목록 보기
          </Link>
          <Link href="/m/my/listings" style={secondaryTopLinkStyle}>
            내 자산 보기
          </Link>
        </section>

        <section
          style={{
            display: 'grid',
            gap: 10,
          }}
        >
          {dealItems.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #eadfcf',
                borderRadius: 22,
                padding: 24,
                textAlign: 'center',
                color: '#6a5743',
                fontSize: 14,
                lineHeight: 1.8,
                boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
              }}
            >
              아직 생성된 거래방이 없습니다.
            </div>
          ) : (
            dealItems.map((deal) => {
              const listing = listingsMap.get(String(deal.listing_id))
              const unreadCount = unreadMap.get(String(deal.id)) || 0

              return (
                <Link
                  key={deal.id}
                  href={`/deal/${deal.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <article
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eadfcf',
                      borderRadius: 22,
                      padding: 16,
                      boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
                      display: 'grid',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 900,
                            color: '#241b11',
                            lineHeight: 1.45,
                            wordBreak: 'keep-all',
                          }}
                        >
                          {listing?.title || '연결된 자산 없음'}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: '#8a745b',
                            fontWeight: 700,
                          }}
                        >
                          최근 업데이트 {formatDate(deal.updated_at)}
                        </div>
                      </div>

                      {unreadCount > 0 ? (
                        <span style={unreadBadgeStyle}>{unreadCount}</span>
                      ) : (
                        <span style={arrowTextStyle}>입장 →</span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        color: '#2f2417',
                      }}
                    >
                      {formatPrice(listing?.price)}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      <div style={infoChipStyle}>
                        상태: {listing?.status ? String(listing.status) : '확인 필요'}
                      </div>
                      <div style={infoChipStyle}>
                        거래방 ID: {String(deal.id).slice(0, 8)}
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '14px 14px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'rgba(255,248,236,0.74)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#fffaf2',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

const secondaryTopLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 14,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const unreadBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 28,
  padding: '0 8px',
  borderRadius: 999,
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 900,
  flexShrink: 0,
}

const arrowTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#8a745b',
  flexShrink: 0,
}

const infoChipStyle: React.CSSProperties = {
  minHeight: 38,
  borderRadius: 12,
  background: '#fbf7f0',
  border: '1px solid #efe4d5',
  color: '#5f4f3f',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 10px',
  textAlign: 'center',
}