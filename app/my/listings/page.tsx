import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryVisual from '@/components/listings/CategoryVisual'

type ListingRow = {
  id: string
  user_id: string | null
  title: string | null
  category: string | null
  price: number | null
  status: string | null
  description: string | null
  created_at: string | null
  updated_at?: string | null
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
    case 'draft':
      return {
        background: '#f8f3eb',
        color: '#6f5d49',
        border: '1px solid rgba(47,36,23,0.08)',
      }
    case 'hidden':
      return {
        background: '#f6f1e7',
        color: '#7b6a58',
        border: '1px solid rgba(47,36,23,0.08)',
      }
    default:
      return {
        background: '#f6f1e7',
        color: '#5c4731',
        border: '1px solid rgba(47,36,23,0.08)',
      }
  }
}

function getSummary(rows: ListingRow[]) {
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'active').length,
    reserved: rows.filter((row) => row.status === 'reserved').length,
    sold: rows.filter((row) => row.status === 'sold').length,
    totalViews: rows.reduce((acc, row) => acc + (row.view_count || 0), 0),
    totalInquiries: rows.reduce((acc, row) => acc + (row.inquiry_count || 0), 0),
  }
}

export default async function MyListingsPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/my/listings')
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (data as ListingRow[] | null) || []
  const summary = getSummary(rows)

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
                내 자산 관리
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
                내가 등록한 자산
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#6b5a47',
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                등록 상태, 문의 흐름, 수정 진입을 한 화면에서 바로 관리할 수 있게 정리했다.
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
              새 자산 등록
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: '전체 자산', value: summary.total.toLocaleString('ko-KR') },
            { label: '거래가능', value: summary.active.toLocaleString('ko-KR') },
            { label: '예약중', value: summary.reserved.toLocaleString('ko-KR') },
            { label: '거래종료', value: summary.sold.toLocaleString('ko-KR') },
            { label: '총 조회수', value: summary.totalViews.toLocaleString('ko-KR') },
            { label: '총 문의수', value: summary.totalInquiries.toLocaleString('ko-KR') },
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

        {rows.length > 0 ? (
          <section
            style={{
              display: 'grid',
              gap: 14,
            }}
          >
            {rows.map((item) => {
              const statusStyle = getStatusStyle(item.status)

              return (
                <article
                  key={item.id}
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
                        <CategoryVisual category={item.category} size="sm" showLabel />

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
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <Link
                        href={`/listings/${item.id}`}
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
                          {item.title || '제목 없음'}
                        </h2>
                      </Link>

                      <p
                        style={{
                          margin: '10px 0 0',
                          color: '#6f5d49',
                          fontSize: 14,
                          lineHeight: 1.65,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description?.trim() || '등록된 설명이 없습니다.'}
                      </p>

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
                            {formatPrice(item.price)}
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
                            조회수
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {(item.view_count || 0).toLocaleString('ko-KR')}
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
                            문의수
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {(item.inquiry_count || 0).toLocaleString('ko-KR')}
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
                            등록일
                          </div>
                          <div
                            style={{
                              color: '#2f2417',
                              fontSize: 15,
                              fontWeight: 900,
                              lineHeight: 1.2,
                            }}
                          >
                            {formatDate(item.created_at)}
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
                        href={`/listings/${item.id}`}
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
                        상세 보기
                      </Link>

                      <Link
                        href={`/listings/${item.id}/edit`}
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
                        수정하기
                      </Link>
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
              아직 등록한 자산이 없습니다.
            </div>
            <div
              style={{
                color: '#6f5d49',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              첫 자산을 등록해서 내 목록과 거래 흐름을 시작해보세요.
            </div>
            <Link
              href="/listings/create"
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
              자산 등록하러 가기
            </Link>
          </section>
        )}

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
            내 자산 목록을 불러오는 중 문제가 발생했습니다.
          </section>
        ) : null}
      </div>
    </main>
  )
}