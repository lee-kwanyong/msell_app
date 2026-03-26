import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type ListingRow = {
  id: string
  title: string | null
  category: string | null
  price: number | string | null
  status: string | null
  created_at: string | null
  description: string | null
}

function formatPrice(value: number | string | null | undefined) {
  const num = typeof value === 'string' ? Number(value) : value

  if (typeof num !== 'number' || Number.isNaN(num)) {
    return '가격 협의'
  }

  return `₩${num.toLocaleString('ko-KR')}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'reserved':
      return '예약중'
    case 'sold':
      return '거래종료'
    case 'draft':
      return '임시저장'
    case 'hidden':
      return '숨김'
    case 'pending_review':
      return '검토중'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관됨'
    default:
      return '상태확인'
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer()

  const [{ data: listings }, { count: activeCount }] = await Promise.all([
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  const safeListings: ListingRow[] = Array.isArray(listings)
    ? listings.map((item: any) => ({
        id: String(item?.id ?? ''),
        title: item?.title ?? null,
        category: item?.category ?? null,
        price: item?.price ?? null,
        status: item?.status ?? null,
        created_at: item?.created_at ?? null,
        description: item?.description ?? null,
      }))
    : []

  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: '100vh',
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '28px 20px 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.7fr 1fr',
            gap: 18,
          }}
          className="msell-home-hero"
        >
          <div
            style={{
              background: '#fbf7ef',
              border: '1px solid #e6dac7',
              borderRadius: 34,
              padding: '34px 32px',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a6a43',
                marginBottom: 18,
              }}
            >
              MSELL · DIGITAL ASSET MARKETPLACE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 68,
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                color: '#20170f',
                fontWeight: 800,
              }}
              className="msell-home-title"
            >
              디지털 자산 거래를
              <br />
              더 간결하게 관리하세요
            </h1>

            <p
              style={{
                margin: '22px 0 0',
                maxWidth: 860,
                fontSize: 21,
                lineHeight: 1.8,
                color: '#6b5b4b',
              }}
              className="msell-home-copy"
            >
              가짜 통계, 임의 차트, 샘플 랭킹 없이 실제 등록 자산 중심으로
              구성했습니다. 지금 등록된 거래가능 자산과 최신 등록 목록만
              확인할 수 있습니다.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 28,
              }}
            >
              <Link
                href="/listings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 50,
                  padding: '0 22px',
                  borderRadius: 999,
                  background: '#2f2417',
                  color: '#fffdf8',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                매물 둘러보기
              </Link>

              <Link
                href="/listings/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 50,
                  padding: '0 22px',
                  borderRadius: 999,
                  background: '#eadfcf',
                  color: '#2f2417',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                자산 등록하기
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 18,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e6dac7',
                borderRadius: 30,
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#8a6a43',
                  marginBottom: 12,
                }}
              >
                현재 공개 현황
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: '#20170f',
                  lineHeight: 1.1,
                }}
              >
                {activeCount ?? 0}건
              </div>
              <p
                style={{
                  margin: '12px 0 0',
                  color: '#6b5b4b',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                거래가능 상태의 실제 등록 자산 기준입니다.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e6dac7',
                borderRadius: 30,
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#8a6a43',
                  marginBottom: 12,
                }}
              >
                운영 방향
              </div>
              <p
                style={{
                  margin: 0,
                  color: '#6b5b4b',
                  fontSize: 15,
                  lineHeight: 1.8,
                }}
              >
                홈에서는 실제 데이터만 보여주고, 상세 수치와 거래 흐름은 각
                매물 및 거래방에서 확인하는 구조로 정리했습니다.
              </p>
            </div>
          </div>
        </div>

        <section
          style={{
            marginTop: 18,
            background: '#fffdf8',
            border: '1px solid #e6dac7',
            borderRadius: 28,
            padding: '22px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: '#2f2417',
                color: '#fffdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a6a43',
                }}
              >
                APP INSTALL
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#20170f',
                }}
              >
                Msell 앱처럼 바로 실행하세요
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#6b5b4b',
                  lineHeight: 1.7,
                }}
              >
                홈 화면에 추가하면 더 빠르게 접속할 수 있습니다.
              </div>
            </div>
          </div>

          <button
            type="button"
            id="install-app-button"
            style={{
              height: 44,
              padding: '0 18px',
              borderRadius: 999,
              border: 'none',
              background: '#2f2417',
              color: '#fffdf8',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            앱 설치하기
          </button>
        </section>

        <section style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 14,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a6a43',
                  marginBottom: 8,
                }}
              >
                LIVE LISTINGS
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 38,
                  lineHeight: 1.1,
                  color: '#20170f',
                  fontWeight: 800,
                }}
              >
                최신 등록 자산
              </h2>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 15,
                  color: '#6b5b4b',
                  lineHeight: 1.7,
                }}
              >
                실제 등록된 거래가능 자산만 표시합니다.
              </p>
            </div>

            <Link
              href="/listings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 42,
                padding: '0 16px',
                borderRadius: 999,
                background: '#eadfcf',
                color: '#2f2417',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              전체 거래목록 보기
            </Link>
          </div>

          {safeListings.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e6dac7',
                borderRadius: 28,
                padding: '34px 24px',
                color: '#6b5b4b',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              아직 공개된 자산이 없습니다. 첫 자산을 등록해보세요.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 14,
              }}
              className="msell-home-grid"
            >
              {safeListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e6dac7',
                    borderRadius: 24,
                    padding: 18,
                    textDecoration: 'none',
                    color: 'inherit',
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          height: 30,
                          padding: '0 12px',
                          borderRadius: 999,
                          background: '#f3eadb',
                          color: '#6d5333',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {item.category || '기타'}
                      </span>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#8a6a43',
                        }}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.35,
                        fontWeight: 800,
                        color: '#20170f',
                        wordBreak: 'keep-all',
                      }}
                    >
                      {item.title || '제목 없음'}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 28,
                        lineHeight: 1.2,
                        fontWeight: 800,
                        color: '#2f2417',
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        color: '#6b5b4b',
                        fontSize: 14,
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description || '설명이 아직 등록되지 않았습니다.'}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 14,
                      borderTop: '1px solid #efe4d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      fontSize: 13,
                      color: '#8a6a43',
                    }}
                  >
                    <span>등록일</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>

      <style>{`
        @media (max-width: 1180px) {
          .msell-home-hero {
            grid-template-columns: 1fr !important;
          }

          .msell-home-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .msell-home-title {
            font-size: 52px !important;
          }

          .msell-home-copy {
            font-size: 18px !important;
          }
        }

        @media (max-width: 760px) {
          .msell-home-grid {
            grid-template-columns: 1fr !important;
          }

          .msell-home-title {
            font-size: 38px !important;
          }

          .msell-home-copy {
            font-size: 15px !important;
          }
        }
      `}</style>
    </main>
  )
}