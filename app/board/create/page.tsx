import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type SearchParams = Promise<{
  error?: string
}>

type ProfileRow = {
  role?: string | null
  is_banned?: boolean | null
}

export default async function BoardCreatePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/board/create')
  }

  const [{ data: profile }, { data: rpcIsAdmin }] = await Promise.all([
    supabase.from('profiles').select('role,is_banned').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_admin'),
  ])

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    redirect('/board?error=' + encodeURIComponent('관리자만 공지를 등록할 수 있습니다.'))
  }

  if (me?.is_banned) {
    redirect('/board?error=' + encodeURIComponent('차단된 계정은 공지를 등록할 수 없습니다.'))
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
              fontSize: 14,
              color: '#5b4632',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ← 공지사항 목록으로 돌아가기
          </Link>

          <Link
            href="/admin"
            className="msell-btn msell-btn-secondary"
            style={{ minHeight: 44 }}
          >
            관리자 홈
          </Link>
        </div>

        {params.error ? (
          <div className="msell-alert msell-alert-danger">{params.error}</div>
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
              <span className="msell-eyebrow">CREATE NOTICE</span>

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
                공지 등록
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
                운영 정책, 사기 방지 안내, 거래 유의사항, 점검 일정처럼
                <br />
                모든 이용자가 먼저 확인해야 하는 공지를 등록하는 화면입니다.
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
                  WRITING GUIDE
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
                  제목은 선명하게,
                  <br />
                  내용은 바로 이해되게.
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
                    1
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.6,
                    }}
                  >
                    제목만 보고도 공지 목적이 이해되게 작성하세요.
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
                    2
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.6,
                    }}
                  >
                    본문은 항목별로 나누면 이용자가 훨씬 빠르게 이해합니다.
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
                    3
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.6,
                    }}
                  >
                    거래 제한, 외부 유도 금지, 신고 절차 같은 핵심 문구는 분명하게 적으세요.
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
                  VISIBILITY
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.6,
                  }}
                >
                  저장 후 공지사항 목록과 상세 페이지에 즉시 반영됩니다.
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
                NOTICE WRITER
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
                새 공지 작성
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: '#6a5743',
                }}
              >
                등록 후 목록과 상세 화면에 바로 노출됩니다.
              </div>
            </div>

            <form
              action="/api/board/create"
              method="post"
              style={{
                display: 'grid',
                gap: 18,
              }}
            >
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
                  required
                  maxLength={200}
                  placeholder="예: 외부 메신저 유도 거래 주의 안내"
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
                  required
                  rows={16}
                  placeholder={`예:
1. 외부 메신저로 거래를 유도하는 경우 주의하세요.
2. 선입금 요구, 계정 선전달 요구 시 거래를 중단하세요.
3. 의심 사례는 즉시 신고 절차에 따라 접수해주세요.`}
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
                <Link href="/board" className="msell-btn msell-btn-secondary">
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
                  공지 등록하기
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