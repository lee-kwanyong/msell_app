import Link from 'next/link'
import { signupAction } from './actions'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

function normalizeNext(next?: string) {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const next = normalizeNext(params.next)
  const error = params.error || ''

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(180deg, #f6f4ef 0%, #f1eee8 100%)',
        padding: '36px 24px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            borderRadius: 34,
            background:
              'radial-gradient(circle at top right, rgba(110,84,49,0.08), transparent 28%), linear-gradient(180deg, #fffdfa 0%, #f7f3ec 100%)',
            border: '1px solid rgba(60,42,23,0.08)',
            boxShadow: '0 20px 50px rgba(34,24,16,0.06)',
            padding: 34,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'rgba(58,40,22,0.48)',
              fontWeight: 700,
            }}
          >
            MSELL
          </div>

          <h1
            style={{
              margin: '16px 0 0',
              fontSize: 44,
              lineHeight: 0.98,
              letterSpacing: '-0.05em',
              fontWeight: 700,
              color: '#18130f',
            }}
          >
            회원가입
          </h1>

          {error ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                border: '1px solid rgba(166, 64, 64, 0.18)',
                background: 'rgba(255, 243, 243, 0.9)',
                color: '#8f2f2f',
                fontSize: 14,
                lineHeight: 1.6,
                padding: '14px 16px',
              }}
            >
              {error}
            </div>
          ) : null}

          <form action={signupAction} style={{ marginTop: 22 }}>
            <input type="hidden" name="next" value={next} />

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'rgba(52,38,24,0.70)',
                  }}
                >
                  이름
                </label>
                <input
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="이름 입력"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 18,
                    border: '1px solid rgba(60,42,23,0.10)',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#18130f',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'rgba(52,38,24,0.70)',
                  }}
                >
                  연락처
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="연락처 입력"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 18,
                    border: '1px solid rgba(60,42,23,0.10)',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#18130f',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'rgba(52,38,24,0.70)',
                  }}
                >
                  이메일
                </label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 18,
                    border: '1px solid rgba(60,42,23,0.10)',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#18130f',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'rgba(52,38,24,0.70)',
                  }}
                >
                  비밀번호
                </label>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 입력"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 18,
                    border: '1px solid rgba(60,42,23,0.10)',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#18130f',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'rgba(52,38,24,0.70)',
                  }}
                >
                  비밀번호 확인
                </label>
                <input
                  name="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 다시 입력"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 18,
                    border: '1px solid rgba(60,42,23,0.10)',
                    background: 'rgba(255,255,255,0.82)',
                    padding: '0 16px',
                    fontSize: 15,
                    color: '#18130f',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  height: 52,
                  border: 'none',
                  borderRadius: 999,
                  background: '#24180f',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(36,24,15,0.16)',
                  marginTop: 4,
                }}
              >
                이메일로 회원가입
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: 20,
              textAlign: 'center',
              fontSize: 14,
              color: 'rgba(52,38,24,0.62)',
            }}
          >
            이미 계정이 있으면{' '}
            <Link
              href={`/auth/login?next=${encodeURIComponent(next)}`}
              style={{
                color: '#24180f',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}