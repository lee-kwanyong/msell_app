import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryVisual from '@/components/listings/CategoryVisual'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

type ListingRow = {
  id: string
  user_id: string | null
  title: string | null
  category: string | null
  price: number | null
  description: string | null
  status: string | null
  created_at: string | null
  updated_at?: string | null
  transfer_method?: string | null
  view_count?: number | null
  inquiry_count?: number | null
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
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'draft':
      return '임시저장'
    case 'hidden':
      return '숨김'
    case 'pending_review':
      return '검수대기'
    case 'reserved':
      return '예약중'
    case 'sold':
      return '거래종료'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관됨'
    default:
      return '상태확인'
  }
}

function getStatusStyle(status?: string | null) {
  switch (status) {
    case 'active':
      return {
        background: '#ecfdf5',
        color: '#166534',
        border: '1px solid rgba(22,101,52,0.12)',
      }
    case 'reserved':
      return {
        background: '#fff7ed',
        color: '#9a3412',
        border: '1px solid rgba(154,52,18,0.12)',
      }
    case 'sold':
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

function getTransferMethod(description?: string | null, transferMethod?: string | null) {
  if (transferMethod?.trim()) {
    return transferMethod.trim()
  }

  const text = description || ''
  const match = text.match(/\[이전 방식\]\s*(.+)/)
  if (match?.[1]) return match[1].trim()

  return '협의'
}

function getCleanDescription(description?: string | null) {
  if (!description) return ''
  return description.replace(/\[이전 방식\]\s*.+/g, '').trim()
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    redirect('/listings')
  }

  const listing = data as ListingRow
  const isOwner = !!user && !!listing.user_id && user.id === listing.user_id
  const statusStyle = getStatusStyle(listing.status)
  const canStartDeal = !!user && !isOwner && listing.status === 'active'

  const cleanDescription = getCleanDescription(listing.description)
  const transferMethod = getTransferMethod(listing.description, listing.transfer_method)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '28px 20px 60px',
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/listings"
            style={{
              textDecoration: 'none',
              color: '#6f5b46',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ← 목록으로
          </Link>

          <span
            style={{
              color: '#b7aa9a',
              fontSize: 13,
            }}
          >
            /
          </span>

          <span
            style={{
              color: '#8a7762',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            상세 보기
          </span>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(340px, 0.85fr)',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              borderRadius: 28,
              background: '#ffffff',
              border: '1px solid rgba(47,36,23,0.08)',
              boxShadow: '0 16px 42px rgba(47,36,23,0.06)',
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <CategoryVisual category={listing.category} size="lg" showLabel />

              <span
                style={{
                  ...statusStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 34,
                  padding: '0 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {getStatusLabel(listing.status)}
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: '#2f2417',
                fontSize: 34,
                lineHeight: 1.18,
                letterSpacing: '-0.04em',
                fontWeight: 900,
              }}
            >
              {listing.title || '제목 없음'}
            </h1>

            <div
              style={{
                marginTop: 18,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #2f2417 0%, #4b3825 100%)',
                padding: 22,
                color: '#fff',
                boxShadow: '0 18px 40px rgba(47,36,23,0.18)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  opacity: 0.78,
                  marginBottom: 8,
                }}
              >
                희망 가격
              </div>

              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.05em',
                }}
              >
                {formatPrice(listing.price)}
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  background: '#fbf8f2',
                  border: '1px solid rgba(47,36,23,0.05)',
                  padding: '16px 14px',
                }}
              >
                <div
                  style={{
                    color: '#8c7864',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  이전 방식
                </div>
                <div
                  style={{
                    color: '#2f2417',
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {transferMethod}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: '#fbf8f2',
                  border: '1px solid rgba(47,36,23,0.05)',
                  padding: '16px 14px',
                }}
              >
                <div
                  style={{
                    color: '#8c7864',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  등록일
                </div>
                <div
                  style={{
                    color: '#2f2417',
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {formatDate(listing.created_at)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: '#fbf8f2',
                  border: '1px solid rgba(47,36,23,0.05)',
                  padding: '16px 14px',
                }}
              >
                <div
                  style={{
                    color: '#8c7864',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  문의 수
                </div>
                <div
                  style={{
                    color: '#2f2417',
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {(listing.inquiry_count || 0).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>

            <section
              style={{
                marginTop: 20,
                borderRadius: 24,
                background: '#fffdf9',
                border: '1px solid rgba(47,36,23,0.06)',
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#2f2417',
                  fontSize: 17,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  marginBottom: 12,
                }}
              >
                자산 설명
              </div>

              <div
                style={{
                  color: '#5f4c39',
                  fontSize: 15,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {cleanDescription || '등록된 상세 설명이 없습니다.'}
              </div>
            </section>
          </div>

          <aside
            style={{
              position: 'sticky',
              top: 24,
              display: 'grid',
              gap: 16,
            }}
          >
            <section
              style={{
                borderRadius: 26,
                background: '#ffffff',
                border: '1px solid rgba(47,36,23,0.08)',
                boxShadow: '0 14px 36px rgba(47,36,23,0.06)',
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#2f2417',
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  marginBottom: 10,
                }}
              >
                거래 액션
              </div>

              <p
                style={{
                  margin: '0 0 16px',
                  color: '#6f5d49',
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                관심이 있다면 바로 거래 문의를 시작하고, 등록자라면 자산 내용을 수정할 수 있다.
              </p>

              {isOwner ? (
                <Link
                  href={`/listings/${listing.id}/edit`}
                  style={{
                    display: 'inline-flex',
                    width: '100%',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    background: '#2f2417',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  내 자산 수정하기
                </Link>
              ) : null}

              {!isOwner && canStartDeal ? (
                <form action="/api/deals/create" method="post" style={{ margin: 0 }}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      height: 52,
                      border: 'none',
                      borderRadius: 16,
                      background: '#2f2417',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: '0 12px 28px rgba(47,36,23,0.16)',
                    }}
                  >
                    거래 문의 시작
                  </button>
                </form>
              ) : null}

              {!user && !isOwner ? (
                <Link
                  href={`/auth/login?next=/listings/${listing.id}`}
                  style={{
                    display: 'inline-flex',
                    width: '100%',
                    height: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    background: '#2f2417',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 900,
                    fontSize: 15,
                  }}
                >
                  로그인 후 문의하기
                </Link>
              ) : null}

              {!isOwner && user && listing.status !== 'active' ? (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    background: '#f8f3eb',
                    color: '#6f5a46',
                    border: '1px solid rgba(47,36,23,0.06)',
                    padding: '14px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  현재 이 자산은 바로 거래를 시작할 수 없는 상태입니다.
                </div>
              ) : null}
            </section>

            <section
              style={{
                borderRadius: 26,
                background: '#ffffff',
                border: '1px solid rgba(47,36,23,0.08)',
                boxShadow: '0 14px 36px rgba(47,36,23,0.06)',
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#2f2417',
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  marginBottom: 12,
                }}
              >
                요약 정보
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.06)',
                  }}
                >
                  <span
                    style={{
                      color: '#8a7762',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    카테고리
                  </span>
                  <span
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {listing.category || '기타'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.06)',
                  }}
                >
                  <span
                    style={{
                      color: '#8a7762',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    상태
                  </span>
                  <span
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {getStatusLabel(listing.status)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.06)',
                  }}
                >
                  <span
                    style={{
                      color: '#8a7762',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    조회수
                  </span>
                  <span
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {(listing.view_count || 0).toLocaleString('ko-KR')}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#8a7762',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    수정일
                  </span>
                  <span
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 800,
                      textAlign: 'right',
                    }}
                  >
                    {formatDate(listing.updated_at || listing.created_at)}
                  </span>
                </div>
              </div>
            </section>

            {error ? (
              <section
                style={{
                  borderRadius: 18,
                  background: '#fff1f2',
                  border: '1px solid rgba(190,24,93,0.12)',
                  color: '#9f1239',
                  padding: '14px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                상세 데이터를 불러오는 중 문제가 발생했습니다.
              </section>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  )
}