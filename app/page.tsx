import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

function formatPrice(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '가격 협의'
  return `${value.toLocaleString('ko-KR')}원`
}

function timeAgo(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const diff = Date.now() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}분 전`
  if (diff < day) return `${Math.max(1, Math.floor(diff / hour))}시간 전`
  return `${Math.max(1, Math.floor(diff / day))}일 전`
}

function categoryLabel(value?: string | null) {
  if (!value) return '기타'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default async function HomePage() {
  const supabase = await supabaseServer()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, category, price, status, created_at, description')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  const liveCount = listings?.length ?? 0

  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: 'calc(100vh - 72px)',
        padding: '38px 20px 90px',
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <section
          className="home-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 0.9fr)',
            gap: 22,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 34,
              border: '1px solid #e4d8c8',
              background:
                'radial-gradient(circle at top right, rgba(236, 225, 208, 0.9), transparent 34%), linear-gradient(180deg, #fcfaf6 0%, #f7f1e8 100%)',
              boxShadow: '0 24px 60px rgba(47,36,23,0.06)',
              padding: '34px 34px 30px',
              minHeight: 360,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 13px',
                borderRadius: 999,
                background: '#efe3d2',
                color: '#7b6140',
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
              }}
            >
              MSELL · DIGITAL ASSET MARKETPLACE
            </div>

            <h1
              style={{
                margin: '18px 0 14px',
                fontSize: 68,
                lineHeight: 0.92,
                letterSpacing: '-0.06em',
                fontWeight: 900,
                color: '#1f1710',
                maxWidth: 720,
              }}
            >
              디지털 자산 거래를
              <br />
              더 간결하게
              <br />
              관리하세요
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: '#6f655b',
                fontSize: 18,
                lineHeight: 1.8,
              }}
            >
              Msell은 과장된 수치나 불필요한 장식을 줄이고, 실제 등록 자산과 실제 거래 흐름에
              집중하는 디지털 자산 거래 화면을 지향합니다. 홈 화면에서 현재 공개 자산,
              신규 등록 흐름, 최신 거래 진입점을 바로 확인할 수 있도록 구성했습니다.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 28,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/listings"
                style={{
                  height: 50,
                  padding: '0 20px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
                  color: '#fffaf3',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: '0 14px 28px rgba(47,36,23,0.16)',
                }}
              >
                매물 둘러보기
              </Link>

              <Link
                href="/listings/create"
                style={{
                  height: 50,
                  padding: '0 20px',
                  borderRadius: 16,
                  border: '1px solid #dfd1bf',
                  background: '#f8efe2',
                  color: '#2f2417',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                자산 등록하기
              </Link>
            </div>

            <div
              className="hero-metrics"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 14,
                marginTop: 30,
              }}
            >
              {[
                {
                  label: '운영 기준',
                  value: '실자산 중심',
                  desc: '임의 지표보다 실제 등록 흐름 우선',
                },
                {
                  label: '화면 구조',
                  value: '간결한 탐색',
                  desc: '핵심 액션과 등록 정보에 집중',
                },
                {
                  label: '브랜드 톤',
                  value: '브라운 프리미엄',
                  desc: '차분하고 신뢰감 있는 거래 인상',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid #e7dccc',
                    background: 'rgba(255,253,250,0.82)',
                    borderRadius: 22,
                    padding: '18px 18px 16px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#8a7458',
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      lineHeight: 1.1,
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      color: '#1f1710',
                      marginBottom: 8,
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#7a6d5f',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <section
              style={{
                borderRadius: 30,
                border: '1px solid #e4d8c8',
                background: '#fffdfa',
                boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
                padding: '26px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#8b7760',
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                현재 공개 현황
              </div>

              <div
                style={{
                  fontSize: 58,
                  lineHeight: 0.95,
                  letterSpacing: '-0.06em',
                  color: '#1f1710',
                  fontWeight: 900,
                }}
              >
                {liveCount}건
              </div>

              <p
                style={{
                  margin: '14px 0 20px',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#746858',
                }}
              >
                현재 활성 상태 기준으로 노출 중인 실제 등록 자산 수입니다.
              </p>

              <div
                style={{
                  borderTop: '1px solid #eee1d2',
                  paddingTop: 16,
                  display: 'grid',
                  gap: 10,
                }}
              >
                {[
                  '활성 상태 자산만 홈에 반영',
                  '최신 등록 흐름을 중심으로 정렬',
                  '상세 페이지로 즉시 진입 가능',
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#5e5245',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: '#2f2417',
                        flex: '0 0 auto',
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                borderRadius: 30,
                border: '1px solid #e4d8c8',
                background: 'linear-gradient(180deg, #fffdfa 0%, #f8f1e7 100%)',
                boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
                padding: '26px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#8b7760',
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                운영 방향
              </div>

              <div
                style={{
                  fontSize: 26,
                  lineHeight: 1.15,
                  letterSpacing: '-0.04em',
                  color: '#1f1710',
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                더 적게 보여주고
                <br />
                더 정확하게 연결합니다
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#746858',
                }}
              >
                Msell 홈은 데이터 과잉보다 등록 품질과 거래 진입 효율에 초점을 맞춥니다.
                사용자는 홈에서 즉시 매물 탐색, 등록 시작, 최신 자산 확인까지 자연스럽게
                이어질 수 있습니다.
              </p>
            </section>
          </div>
        </section>

        <section
          style={{
            marginTop: 22,
            borderRadius: 30,
            border: '1px solid #e4d8c8',
            background: 'linear-gradient(180deg, #fffdfa 0%, #f8f2e8 100%)',
            boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              minWidth: 280,
              flex: '1 1 620px',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: '#2f2417',
                color: '#fffaf3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 900,
                boxShadow: '0 12px 24px rgba(47,36,23,0.18)',
              }}
            >
              M
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8a7458',
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                APP INSTALL
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  color: '#1f1710',
                  fontWeight: 900,
                  marginBottom: 6,
                }}
              >
                Msell 앱처럼 바로 실행하세요
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#756858',
                }}
              >
                홈 화면에 추가하면 더 빠르게 접속할 수 있도록 설치 흐름을 유지합니다.
              </div>
            </div>
          </div>

          <button
            type="button"
            style={{
              height: 46,
              padding: '0 18px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
              color: '#fffaf3',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(47,36,23,0.16)',
            }}
          >
            앱 설치하기
          </button>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8a7458',
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                LIVE LISTINGS
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 0.98,
                  letterSpacing: '-0.05em',
                  color: '#1f1710',
                  fontWeight: 900,
                }}
              >
                최신 등록 자산
              </h2>
              <p
                style={{
                  margin: '12px 0 0',
                  color: '#756858',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                현재 공개 상태의 실제 등록 자산을 최신순으로 표시합니다.
              </p>
            </div>

            <Link
              href="/listings"
              style={{
                height: 44,
                padding: '0 16px',
                borderRadius: 14,
                border: '1px solid #e0d4c4',
                background: '#f0e4d3',
                color: '#2f2417',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              전체 거래목록 보기
            </Link>
          </div>

          {liveCount > 0 ? (
            <div
              className="listing-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {listings?.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <article
                    style={{
                      height: '100%',
                      borderRadius: 26,
                      border: '1px solid #e4d8c8',
                      background: 'linear-gradient(180deg, #fffdfa 0%, #fbf6ee 100%)',
                      boxShadow: '0 14px 40px rgba(47,36,23,0.05)',
                      padding: '20px 20px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '7px 11px',
                          borderRadius: 999,
                          background: '#efe3d2',
                          color: '#7b6140',
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {categoryLabel(item.category)}
                      </span>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#8a7a67',
                        }}
                      >
                        {timeAgo(item.created_at)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 28,
                        lineHeight: 1.08,
                        letterSpacing: '-0.04em',
                        fontWeight: 900,
                        color: '#1f1710',
                        minHeight: 60,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: '#756858',
                        minHeight: 78,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description || '등록된 설명이 없습니다.'}
                    </div>

                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        borderTop: '1px solid #ece0d2',
                        paddingTop: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#8b7760',
                            fontWeight: 800,
                            marginBottom: 4,
                          }}
                        >
                          희망 가격
                        </div>
                        <div
                          style={{
                            fontSize: 24,
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            color: '#1f1710',
                            fontWeight: 900,
                          }}
                        >
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div
                        style={{
                          height: 42,
                          padding: '0 14px',
                          borderRadius: 14,
                          background: '#2f2417',
                          color: '#fffaf3',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        상세 보기
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                borderRadius: 26,
                border: '1px solid #e4d8c8',
                background: '#fffdfa',
                boxShadow: '0 14px 40px rgba(47,36,23,0.05)',
                padding: '26px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.12,
                    letterSpacing: '-0.04em',
                    color: '#1f1710',
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  아직 공개된 자산이 없습니다
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: '#756858',
                  }}
                >
                  첫 자산을 등록해 홈 화면의 첫 매물을 만들어보세요.
                </div>
              </div>

              <Link
                href="/listings/create"
                style={{
                  height: 46,
                  padding: '0 18px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
                  color: '#fffaf3',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: '0 12px 24px rgba(47,36,23,0.16)',
                }}
              >
                첫 자산 등록하기
              </Link>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 1180px) {
          .home-hero-grid {
            grid-template-columns: 1fr !important;
          }

          .listing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 820px) {
          .hero-metrics {
            grid-template-columns: 1fr !important;
          }

          .listing-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .home-hero-grid h1 {
            font-size: 48px !important;
          }
        }
      `}</style>
    </main>
  )
}