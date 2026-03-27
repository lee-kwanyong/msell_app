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

export default async function MyDealsPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/my/deals')
  }

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  const dealItems = deals ?? []
  const listingIds = Array.from(new Set(dealItems.map((item) => item.listing_id).filter(Boolean)))

  let listingsMap = new Map<string, any>()
  if (listingIds.length > 0) {
    const { data: listings } = await supabase.from('listings').select('*').in('id', listingIds)
    listingsMap = new Map((listings ?? []).map((item) => [String(item.id), item]))
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '24px 20px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#8a745b', fontWeight: 800, letterSpacing: '0.08em' }}>
              MY DEALS
            </div>
            <h1 style={{ margin: '8px 0 0', fontSize: 34, fontWeight: 900, color: '#241b11' }}>
              내 거래
            </h1>
          </div>

          <Link href="/listings" style={topButtonSecondary}>
            거래목록
          </Link>
        </section>

        {dealItems.length === 0 ? (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: 28,
              textAlign: 'center',
              color: '#6a5743',
              boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            }}
          >
            아직 생성된 거래방이 없습니다.
          </section>
        ) : (
          <section
            style={{
              display: 'grid',
              gap: 12,
            }}
          >
            {dealItems.map((deal) => {
              const listing = listingsMap.get(String(deal.listing_id))

              return (
                <Link
                  key={deal.id}
                  href={`/deal/${deal.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <article
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eadfcf',
                      borderRadius: 22,
                      padding: 18,
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
                      <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#241b11',
                            lineHeight: 1.4,
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

                      <span style={{ fontSize: 13, color: '#6a5743', fontWeight: 800 }}>입장 →</span>
                    </div>

                    <div
                      style={{
                        fontSize: 24,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        color: '#2f2417',
                      }}
                    >
                      {formatPrice(listing?.price)}
                    </div>
                  </article>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

const topButtonSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  padding: '0 16px',
  borderRadius: 14,
  background: '#ffffff',
  border: '1px solid #eadfcf',
  color: '#2f2417',
  textDecoration: 'none',
  fontWeight: 800,
}