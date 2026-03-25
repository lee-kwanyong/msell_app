import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

type SearchParams = Promise<{
  success?: string
  error?: string
}>

type NoticeRow = {
  id: string
  title: string | null
  created_at: string | null
}

type ProfileRow = {
  role?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false

  if (user) {
    const [{ data: profile }, { data: rpcIsAdmin }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])

    const me = (profile as ProfileRow | null) ?? null
    isAdmin = rpcIsAdmin === true || me?.role === 'admin'
  }

  const { data: notices } = await supabase
    .from('posts')
    .select('id,title,created_at')
    .eq('source', 'notice')
    .order('created_at', { ascending: false })

  const rows = (notices as NoticeRow[] | null) ?? []
  const latestNotice = rows[0] ?? null

  return (
    <main className="msell-page">
      <div className="msell-shell">
        <section
          className="msell-card"
          style={{
            padding: '28px 30px 26px',
            background:
              'radial-gradient(circle at top right, rgba(224, 202, 176, 0.42), transparent 28%), linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
              gap: 18,
              alignItems: 'stretch',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <span className="msell-eyebrow">NOTICE BOARD</span>

              <h1
                style={{
                  margin: '18px 0 0',
                  fontSize: 'clamp(34px, 3.6vw, 54px)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.06em',
                  fontWeight: 950,
                  color: '#2c1f14',
                }}
              >
                운영 공지사항
              </h1>

              <p
                style={{
                  margin: '16px 0 0',
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: '#645442',
                  maxWidth: 760,
                }}
              >
                거래 운영 원칙, 사기 방지 안내, 정책 변경, 점검 일정 등
                <br />
                이용 전에 반드시 확인해야 하는 공지사항을 한 곳에 모아두었습니다.
              </p>

              <div
                style={{
                  marginTop: 22,
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Link href="/listings" className="msell-btn msell-btn-secondary">
                  매물 보기
                </Link>

                {isAdmin ? (
                  <Link href="/board/create" className="msell-btn msell-btn-primary">
                    공지 등록
                  </Link>
                ) : null}
              </div>
            </div>

            <aside
              style={{
                borderRadius: 24,
                padding: '18px 18px 16px',
                background: 'linear-gradient(180deg, #3a291a 0%, #20160e 100%)',
                color: '#ffffff',
                boxShadow: '0 18px 34px rgba(34, 23, 13, 0.16)',
                display: 'grid',
                gap: 14,
                alignContent: 'start',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    opacity: 0.72,
                  }}
                >
                  BOARD SUMMARY
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  운영 정책과 거래 유의사항을
                  <br />
                  가장 먼저 확인하세요.
                </div>
              </div>

              <div
                style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.12)',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      opacity: 0.72,
                    }}
                  >
                    TOTAL NOTICES
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {rows.length}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      opacity: 0.72,
                    }}
                  >
                    LATEST
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {latestNotice?.created_at ? formatDate(latestNotice.created_at) : '-'}
                  </div>
                </div>
              </div>

              {latestNotice ? (
                <Link
                  href={`/board/${latestNotice.id}`}
                  style={{
                    marginTop: 4,
                    display: 'block',
                    borderRadius: 18,
                    padding: '14px 14px 13px',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      opacity: 0.72,
                    }}
                  >
                    LATEST NOTICE
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 15,
                      fontWeight: 900,
                      lineHeight: 1.55,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {latestNotice.title || '제목 없음'}
                  </div>
                </Link>
              ) : null}
            </aside>
          </div>
        </section>

        {params.success ? (
          <div className="msell-alert msell-alert-success">{params.success}</div>
        ) : null}

        {params.error ? (
          <div className="msell-alert msell-alert-danger">{params.error}</div>
        ) : null}

        <section className="msell-section">
          <section className="msell-card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(180deg, #f8f1e5 0%, #f4eadb 100%)',
                borderBottom: '1px solid #e4d3bc',
                display: 'grid',
                gridTemplateColumns: '110px minmax(0, 1fr) 140px',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#8a7762',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                No.
              </div>

              <div
                style={{
                  color: '#8a7762',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Title
              </div>

              <div
                style={{
                  textAlign: 'right',
                  color: '#8a7762',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Date
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="msell-empty" style={{ margin: 20 }}>
                아직 등록된 공지사항이 없습니다.
                <br />
                운영 공지, 정책 변경, 유의사항이 등록되면 이곳에 표시됩니다.
              </div>
            ) : (
              <div style={{ display: 'grid' }}>
                {rows.map((notice, index) => {
                  const isLatest = index === 0
                  const numberLabel = isLatest ? '공지' : String(rows.length - index)

                  return (
                    <Link
                      key={notice.id}
                      href={`/board/${notice.id}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '110px minmax(0, 1fr) 140px',
                        gap: 16,
                        alignItems: 'center',
                        padding: '20px 20px',
                        textDecoration: 'none',
                        borderBottom:
                          index === rows.length - 1 ? 'none' : '1px solid #eee2d1',
                        background: isLatest
                          ? 'linear-gradient(180deg, #fffdfa 0%, #fcf6ee 100%)'
                          : '#ffffff',
                        transition:
                          'background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                      }}
                    >
                      <div>
                        {isLatest ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 30,
                              padding: '0 12px',
                              borderRadius: 999,
                              background: 'linear-gradient(180deg, #3a291a 0%, #20160e 100%)',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 800,
                              boxShadow: '0 10px 20px rgba(34, 23, 13, 0.12)',
                            }}
                          >
                            {numberLabel}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 34,
                              minHeight: 34,
                              padding: '0 10px',
                              borderRadius: 999,
                              background: '#f4eadb',
                              color: '#6f5841',
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {numberLabel}
                          </span>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: '#2c1f14',
                            fontSize: isLatest ? 17 : 16,
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {notice.title || '제목 없음'}
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          color: '#7e6b57',
                          fontSize: 13,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(notice.created_at)}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </section>
      </div>

      <style>{`
        .board-row-link:hover {
          background: #fcf8f1;
        }

        @media (max-width: 920px) {
          .msell-page div[style*='grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr)'] {
            grid-template-columns: 1fr !important;
          }

          .msell-page div[style*='grid-template-columns: repeat(2, minmax(0, 1fr))'] {
            grid-template-columns: 1fr !important;
          }

          .msell-page div[style*='grid-template-columns: 110px minmax(0, 1fr) 140px'] {
            grid-template-columns: 82px minmax(0, 1fr) 96px !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 640px) {
          .msell-page div[style*='grid-template-columns: 110px minmax(0, 1fr) 140px'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}