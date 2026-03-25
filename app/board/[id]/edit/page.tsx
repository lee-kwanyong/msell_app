import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

type NoticeRow = {
  id: string
  title: string | null
  content: string | null
  source: string | null
  created_at?: string | null
}

type ProfileRow = {
  role?: string | null
  is_banned?: boolean | null
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

export default async function BoardEditPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = await searchParams
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/board/${id}/edit`)
  }

  const [{ data: profile }, { data: rpcIsAdmin }] = await Promise.all([
    supabase.from('profiles').select('role,is_banned').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_admin'),
  ])

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    redirect('/board?error=' + encodeURIComponent('관리자만 공지를 수정할 수 있습니다.'))
  }

  if (me?.is_banned) {
    redirect('/board?error=' + encodeURIComponent('차단된 계정은 공지를 수정할 수 없습니다.'))
  }

  const { data } = await supabase
    .from('posts')
    .select('id,title,content,source,created_at')
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
            href={`/board/${notice.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: '#5b4632',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ← 공지 상세로 돌아가기
          </Link>

          <Link
            href="/board"
            className="msell-btn msell-btn-secondary"
            style={{ minHeight: 44 }}
          >
            공지 목록
          </Link>
        </div>

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
              <span className="msell-eyebrow">EDIT NOTICE</span>

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
                공지 수정
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
                이용자에게 실제로 노출되는 운영 공지입니다.
                <br />
                제목과 내용을 더 명확하고 신뢰감 있게 정리한 뒤 저장하세요.
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
                  EDIT GUIDE
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
                  공지는 짧고 선명하게,
                  <br />
                  내용은 이해하기 쉽게.
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
                    NOTICE DATE
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
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
                    VISIBILITY
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.5,
                    }}
                  >
                    즉시 반영
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
                  QUICK TIP
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.6,
                  }}
                >
                  제목은 한 번에 이해되게, 본문은 항목별로 읽히게 작성하면 더 좋습니다.
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
                NOTICE EDITOR
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
                공지 내용 수정
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: '#6a5743',
                }}
              >
                수정 후 저장하면 상세 페이지와 목록에 바로 반영됩니다.
              </div>
            </div>

            <form
              action="/api/board/update"
              method="post"
              style={{
                display: 'grid',
                gap: 18,
              }}
            >
              <input type="hidden" name="id" value={notice.id} />

              <div>
                <label
                  htmlFor="title"
                  style={{
                    display: 'block',
                    marginBottom: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#2c1f14',
                  }}
                >
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  defaultValue={notice.title || ''}
                  required
                  maxLength={200}
                  style={{
                    width: '100%',
                    height: 54,
                    borderRadius: 16,
                    border: '1px solid #dcc1a2',
                    background: '#fffdfa',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#22170d',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  style={{
                    display: 'block',
                    marginBottom: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#2c1f14',
                  }}
                >
                  내용
                </label>
                <textarea
                  id="content"
                  name="content"
                  defaultValue={notice.content || ''}
                  required
                  rows={16}
                  style={{
                    width: '100%',
                    minHeight: 340,
                    borderRadius: 20,
                    border: '1px solid #dcc1a2',
                    background: '#fffdfa',
                    padding: '18px 16px',
                    fontSize: 15,
                    lineHeight: 1.9,
                    color: '#22170d',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  paddingTop: 4,
                }}
              >
                <Link
                  href={`/board/${notice.id}`}
                  className="msell-btn msell-btn-secondary"
                >
                  취소
                </Link>

                <button
                  type="submit"
                  className="msell-btn msell-btn-primary"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  수정 저장하기
                </button>
              </div>
            </form>
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