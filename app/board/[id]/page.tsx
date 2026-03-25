import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

type NoticeRow = {
  id: string
  title: string | null
  content: string | null
  created_at: string | null
  source: string | null
  user_id: string | null
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

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function BoardDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = await searchParams
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

  const { data } = await supabase
    .from('posts')
    .select('id,title,content,created_at,source,user_id')
    .eq('id', id)
    .eq('source', 'notice')
    .maybeSingle()

  const notice = (data as NoticeRow | null) ?? null

  if (!notice) {
    notFound()
  }

  return (
    <main className="msell-page">
      <div className="msell-shell">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <Link
            href="/board"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: '#5b4632',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ← 공지사항 목록으로 돌아가기
          </Link>

          {isAdmin ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href={`/board/${notice.id}/edit`}
                className="msell-btn msell-btn-secondary"
                style={{ minHeight: 44 }}
              >
                공지 수정
              </Link>

              <form action="/api/board/delete" method="post" style={{ margin: 0 }}>
                <input type="hidden" name="id" value={notice.id} />
                <button
                  type="submit"
                  className="msell-btn msell-btn-primary"
                  style={{
                    minHeight: 44,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  공지 삭제
                </button>
              </form>
            </div>
          ) : null}
        </div>

        {query.success ? (
          <div className="msell-alert msell-alert-success">{query.success}</div>
        ) : null}

        {query.error ? (
          <div className="msell-alert msell-alert-danger">{query.error}</div>
        ) : null}

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
              <span className="msell-eyebrow">NOTICE DETAIL</span>

              <h1
                style={{
                  margin: '18px 0 0',
                  fontSize: 'clamp(32px, 3.3vw, 50px)',
                  lineHeight: 1.06,
                  letterSpacing: '-0.055em',
                  fontWeight: 950,
                  color: '#2c1f14',
                  wordBreak: 'break-word',
                }}
              >
                {notice.title || '제목 없음'}
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
                운영 정책, 사기 방지 안내, 거래 유의사항 등
                <br />
                서비스 이용 전 반드시 확인해야 하는 안내사항입니다.
              </p>
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
                  NOTICE META
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.25,
                  }}
                >
                  정책·안내·거래 유의사항
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
                    DATE
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      fontWeight: 800,
                      lineHeight: 1.5,
                    }}
                  >
                    {formatDate(notice.created_at)}
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
                    UPDATED VIEW
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      fontWeight: 800,
                      lineHeight: 1.5,
                    }}
                  >
                    {formatDateTime(notice.created_at)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 4,
                  borderRadius: 18,
                  padding: '14px 14px 13px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                  QUICK ACTION
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.6,
                  }}
                >
                  운영 공지 확인 후 매물 비교와 거래 문의를 진행하세요.
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="msell-section">
          <section className="msell-card msell-panel">
            <div
              style={{
                marginBottom: 18,
                borderRadius: 20,
                padding: '16px 18px',
                background: 'linear-gradient(180deg, #f8f1e5 0%, #f2e6d3 100%)',
                border: '1px solid #e2d0b7',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a7762',
                }}
              >
                NOTICE CONTENT
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#2c1f14',
                }}
              >
                공지 상세 내용
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: '#6a5743',
                }}
              >
                아래 내용을 충분히 검토한 뒤 서비스 이용 및 거래를 진행하세요.
              </div>
            </div>

            <div
              style={{
                borderRadius: 24,
                background: 'linear-gradient(180deg, #fffdf9 0%, #faf3e8 100%)',
                border: '1px solid #e8d8c2',
                padding: '30px 26px',
                fontSize: 17,
                lineHeight: 2.05,
                color: '#4a3829',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              {notice.content || ''}
            </div>
          </section>
        </section>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .msell-page div[style*='grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr)'] {
            grid-template-columns: 1fr !important;
          }

          .msell-page div[style*='grid-template-columns: repeat(2, minmax(0, 1fr))'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}