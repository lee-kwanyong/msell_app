import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryVisual from '@/components/listings/CategoryVisual'

type ListingRow = {
  id: string
  title: string | null
  category: string | null
  price: number | null
  status: string | null
  created_at: string | null
  view_count?: number | null
  like_count?: number | null
  inquiry_count?: number | null
  description?: string | null
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
    month: 'numeric',
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

export default async function ListingsPage() {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = ((data as ListingRow[] | null) || []).filter((item) => {
    const status = item.status || ''
    return ['active', 'reserved', 'sold'].includes(status)
  })

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 1480,
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
            marginBottom: 22,
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
                자산 마켓
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
                거래 가능한 디지털 자산 목록
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#6b5a47',
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                카테고리, 가격, 상태를 한눈에 보고 빠르게 문의를 시작할 수 있도록 정리했다.
              </p>
            </div>

            <Link
              href="/listings/create"
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
              자산 등록하기
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          {rows.map((item) => {
            const statusStyle = getStatusStyle(item.status)

            return (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <article
                  style={{
                    height: '100%',
                    borderRadius: 24,
                    background: '#ffffff',
                    border: '1px solid rgba(47,36,23,0.08)',
                    boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
                    padding: 16,
                    transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <CategoryVisual category={item.category} size="sm" showLabel />

                    <span
                      style={{
                        ...statusStyle,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 999,
                        minHeight: 28,
                        padding: '0 10px',
                        fontSize: 12,
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 17,
                      lineHeight: 1.35,
                      fontWeight: 800,
                      color: '#2f2417',
                      letterSpacing: '-0.03em',
                      minHeight: 46,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title || '제목 없음'}
                  </h2>

                  <div
                    style={{
                      marginTop: 12,
                      padding: '14px 14px 12px',
                      borderRadius: 18,
                      background: '#fbf8f2',
                      border: '1px solid rgba(47,36,23,0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: '#8a755f',
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      희망 가격
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.1,
                        fontWeight: 900,
                        color: '#2f2417',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <p
                    style={{
                      margin: '12px 0 0',
                      color: '#7a6753',
                      fontSize: 13,
                      lineHeight: 1.55,
                      minHeight: 42,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description?.trim() || '등록된 설명이 아직 없습니다.'}
                  </p>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 14,
                        background: '#f8f3eb',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8d7760',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        조회
                      </div>
                      <div
                        style={{
                          color: '#2f2417',
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {(item.view_count || 0).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 14,
                        background: '#f8f3eb',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8d7760',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        문의
                      </div>
                      <div
                        style={{
                          color: '#2f2417',
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {(item.inquiry_count || 0).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 14,
                        background: '#f8f3eb',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8d7760',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        등록
                      </div>
                      <div
                        style={{
                          color: '#2f2417',
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </section>

        {rows.length === 0 ? (
          <section
            style={{
              marginTop: 18,
              borderRadius: 24,
              background: '#fff',
              border: '1px solid rgba(47,36,23,0.08)',
              padding: '38px 20px',
              textAlign: 'center',
              color: '#6f5d49',
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: '#2f2417',
                marginBottom: 8,
              }}
            >
              아직 표시할 자산이 없습니다.
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              첫 번째 등록을 올리고 거래 흐름을 시작해보세요.
            </div>
          </section>
        ) : null}

        {error ? (
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
            목록을 불러오는 중 문제가 발생했습니다.
          </section>
        ) : null}
      </div>
    </main>
  )
}