import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryVisual from '@/components/listings/CategoryVisual'

type DealRow = {
  id: string
  listing_id: string | null
  buyer_id: string | null
  seller_id: string | null
  status: string | null
  created_at: string | null
  updated_at?: string | null
}

type ListingRow = {
  id: string
  title: string | null
  category: string | null
  price: number | null
  status: string | null
  created_at: string | null
}

type NotificationRow = {
  id: string
  deal_id: string | null
  is_read: boolean | null
}

function formatPrice(price: number | null | undefined) {
  if (!price || Number.isNaN(price)) return '가격 협의'
  return `${price.toLocaleString('ko-KR')}원`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

function getDealStatusLabel(status?: string | null) {
  switch (status) {
    case 'open':
      return '진행중'
    case 'pending':
      return '대기중'
    case 'completed':
      return '거래완료'
    case 'cancelled':
      return '취소됨'
    case 'closed':
      return '종료됨'
    default:
      return status || '상태확인'
  }
}

function getDealStatusStyle(status?: string | null) {
  switch (status) {
    case 'open':
      return {
        background: '#ecfdf5',
        color: '#166534',
        border: '1px solid rgba(22,101,52,0.12)',
      }
    case 'pending':
      return {
        background: '#fff7ed',
        color: '#9a3412',
        border: '1px solid rgba(154,52,18,0.12)',
      }
    case 'completed':
      return {
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid rgba(29,78,216,0.12)',
      }
    case 'cancelled':
    case 'closed':
      return {
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid rgba(55,65,81,0.10)',
      }
    default:
      return {
        background: '#f6f1e7',
        color: '#5c4731',
        border: '1px solid rgba(47,36,23,0.08)',
      }
  }
}

function getRoleLabel(isBuyer: boolean, isSeller: boolean) {
  if (isBuyer) return '구매자'
  if (isSeller) return '판매자'
  return '참여자'
}

export default async function MyDealsPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/my/deals')
  }

  const { data: dealsData, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const deals = (dealsData as DealRow[] | null) || []
  const listingIds = Array.from(new Set(deals.map((deal) => deal.listing_id).filter(Boolean))) as string[]
  const dealIds = Array.from(new Set(deals.map((deal) => deal.id)))

  let listingsMap = new Map<string, ListingRow>()
  if (listingIds.length > 0) {
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds)

    listingsMap = new Map(
      (((listingsData as ListingRow[] | null) || []).map((listing) => [listing.id, listing]))
    )
  }

  let unreadMap = new Map<string, number>()
  if (dealIds.length > 0) {
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('id, deal_id, is_read')
      .in('deal_id', dealIds)
      .eq('is_read', false)

    const notifications = (notificationsData as NotificationRow[] | null) || []
    unreadMap = notifications.reduce((map, item) => {
      if (!item.deal_id) return map
      map.set(item.deal_id, (map.get(item.deal_id) || 0) + 1)
      return map
    }, new Map<string, number>())
  }

  const totalCount = deals.length
  const openCount = deals.filter((deal) => deal.status === 'open').length
  const pendingCount = deals.filter((deal) => deal.status === 'pending').length
  const completedCount = deals.filter((deal) => deal.status === 'completed').length
  const unreadCount = Array.from(unreadMap.values()).reduce((acc, cur) => acc + cur, 0)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          padding: '28px 20px 60px',
        }}
      >
        <section
          style={{
            borderRadius: 28,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(246,241,231,0.92) 100%)',
            border: '1px solid rgba(47,36,23,0.08)',
            boxShadow: '0 18px 50px rgba(47,36,23,0.06)',
            padding: '24px 22px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 999,
                  background: '#efe7da',
                  color: '#6b5338',
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}
              >
                거래 관리
              </div>

              <h1
                style={{
                  margin: 0,
                  color: '#2f2417',
                  fontSize: 30,
                  lineHeight: 1.2,
                  letterSpacing: '-0.04em',
                  fontWeight: 800,
                }}
              >
                내 거래 현황
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#6b5a47',
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                진행중인 문의, 완료 거래, 읽지 않은 알림까지 한 번에 볼 수 있게 구성했다.
              </p>
            </div>

            <Link
              href="/listings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 18px',
                borderRadius: 14,
                background: '#2f2417',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 10px 24px rgba(47,36,23,0.16)',
              }}
            >
              자산 목록 보기
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: '전체 거래', value: totalCount.toLocaleString('ko-KR') },
            { label: '진행중', value: openCount.toLocaleString('ko-KR') },
            { label: '대기중', value: pendingCount.toLocaleString('ko-KR') },
            { label: '거래완료', value: completedCount.toLocaleString('ko-KR') },
            { label: '안 읽은 알림', value: unreadCount.toLocaleString('ko-KR') },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid rgba(47,36,23,0.08)',
                boxShadow: '0 10px 24px rgba(47,36,23,0.05)',
                padding: '16px 16px',
              }}
            >
              <div
                style={{
                  color: '#8b7762',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  color: '#2f2417',
                  fontSize: 24,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </section>

        {deals.length > 0 ? (
          <section
            style={{
              display: 'grid',
              gap: 14,
            }}
          >
            {deals.map((deal) => {
              const listing = deal.listing_id ? listingsMap.get(deal.listing_id) : undefined
              const isBuyer = deal.buyer_id === user.id
              const isSeller = deal.seller_id === user.id
              const unread = unreadMap.get(deal.id) || 0
              const statusStyle = getDealStatusStyle(deal.status)

              return (
                <article
                  key={deal.id}
                  style={{
                    borderRadius: 24,
                    background: '#fff',
                    border: '1px solid rgba(47,36,23,0.08)',
                    boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.5fr) minmax(240px, 0.8fr)',
                      gap: 18,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <CategoryVisual category={listing?.category} size="sm" showLabel />

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 28,
                              padding: '0 10px',
                              borderRadius: 999,
                              background: '#f8f3eb',
                              color: '#6f5d49',
                              border: '1px solid rgba(47,36,23,0.08)',
                              fontSize: 12,
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getRoleLabel(isBuyer, isSeller)}
                          </span>

                          {unread > 0 ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 28,
                                padding: '0 10px',
                                borderRadius: 999,
                                background: '#fff1f2',
                                color: '#be123c',
                                border: '1px solid rgba(190,24,93,0.12)',
                                fontSize: 12,
                                fontWeight: 900,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              새 알림 {unread}
                            </span>
                          ) : null}
                        </div>

                        <span
                          style={{
                            ...statusStyle,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 30,
                            padding: '0 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getDealStatusLabel(deal.status)}
                        </span>
                      </div>

                      <Link
                        href={`/deal/${deal.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            color: '#2f2417',
                            fontSize: 22,
                            lineHeight: 1.3,
                            letterSpacing: '-0.03em',
                            fontWeight: 900,
                          }}
                        >
                          {listing?.title || '연결된 자산 정보 없음'}
                        </h2>
                      </Link>

                      <div
                        style={{
                          marginTop: 14,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            borderRadius: 16,
                            background: '#fbf8f2',
                            padding: '12px 10px',
                          }}
                        >
                          <div
                            style={{
                              color: '#8d7760',
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 6,
                            }}
                          >
                            희망 가격
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {formatPrice(listing?.price)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            background: '#fbf8f2',
                            padding: '12px 10px',
                          }}
                        >
                          <div
                            style={{
                              color: '#8d7760',
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 6,
                            }}
                          >
                            자산 상태
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {listing?.status || '-'}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            background: '#fbf8f2',
                            padding: '12px 10px',
                          }}
                        >
                          <div
                            style={{
                              color: '#8d7760',
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 6,
                            }}
                          >
                            거래 생성일
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {formatDate(deal.created_at)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            background: '#fbf8f2',
                            padding: '12px 10px',
                          }}
                        >
                          <div
                            style={{
                              color: '#8d7760',
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 6,
                            }}
                          >
                            최근 갱신
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {formatDate(deal.updated_at || deal.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: 10,
                      }}
                    >
                      <Link
                        href={`/deal/${deal.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: 46,
                          borderRadius: 14,
                          background: '#2f2417',
                          color: '#fff',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        거래방 열기
                      </Link>

                      {listing?.id ? (
                        <Link
                          href={`/listings/${listing.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: 46,
                            borderRadius: 14,
                            background: '#eadfcf',
                            color: '#2f2417',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 800,
                          }}
                        >
                          자산 상세 보기
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        ) : (
          <section
            style={{
              borderRadius: 24,
              background: '#fff',
              border: '1px solid rgba(47,36,23,0.08)',
              padding: '40px 22px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: '#2f2417',
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              아직 진행 중인 거래가 없습니다.
            </div>
            <div
              style={{
                color: '#6f5d49',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              자산 목록에서 관심 있는 항목에 문의를 시작하면 이곳에 거래가 쌓입니다.
            </div>
            <Link
              href="/listings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 46,
                padding: '0 18px',
                borderRadius: 14,
                background: '#2f2417',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              자산 보러 가기
            </Link>
          </section>
        )}

        {dealsError ? (
          <section
            style={{
              marginTop: 16,
              borderRadius: 18,
              background: '#fff1f2',
              border: '1px solid rgba(190,24,93,0.12)',
              color: '#9f1239',
              padding: '14px 16px',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            내 거래 목록을 불러오는 중 문제가 발생했습니다.
          </section>
        ) : null}
      </div>
    </main>
  )
}