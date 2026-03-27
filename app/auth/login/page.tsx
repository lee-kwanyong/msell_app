import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { loginAction } from './actions'
import AuthGateway from '@/components/auth/AuthGateway'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

function getSafeNext(next?: string) {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

function getErrorMessage(error?: string) {
  switch (error) {
    case 'missing_fields':
      return '이메일과 비밀번호를 모두 입력해주세요.'
    case 'invalid_credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'oauth_failed':
      return '소셜 로그인 처리 중 문제가 발생했습니다.'
    default:
      return ''
  }
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) || {}
  const next = getSafeNext(resolved.next)
  const errorMessage = getErrorMessage(resolved.error)

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(next || '/')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '56px 20px 80px',
        }}
      >
        <section
          style={{
            borderRadius: 28,
            background: '#fff',
            border: '1px solid rgba(47,36,23,0.08)',
            boxShadow: '0 16px 42px rgba(47,36,23,0.06)',
            padding: 20,
          }}
        >
          <div
            style={{
              color: '#9a6b2f',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            EMAIL LOGIN
          </div>

          <h1
            style={{
              margin: 0,
              color: '#2f2417',
              fontSize: 28,
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: '-0.04em',
            }}
          >
            이메일 로그인
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              color: '#7a6753',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            이미 가입한 회원은 이메일과 비밀번호를 입력해 바로 로그인하세요.
          </p>

          {errorMessage ? (
            <div
              style={{
                marginTop: 14,
                borderRadius: 14,
                background: '#fff1f2',
                border: '1px solid rgba(190,24,93,0.12)',
                color: '#9f1239',
                padding: '12px 14px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <form action={loginAction} style={{ marginTop: 18 }}>
            <input type="hidden" name="next" value={next} />

            <div style={{ marginBottom: 12 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#6f5d49',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.12)',
                  background: '#fffdf9',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#2f2417',
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#6f5d49',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.12)',
                  background: '#fffdf9',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#2f2417',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: 48,
                border: 'none',
                borderRadius: 999,
                background: '#2f2417',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              이메일 로그인
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              margin: '18px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'rgba(47,36,23,0.10)' }} />
            <div
              style={{
                color: '#8d7760',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              OR
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(47,36,23,0.10)' }} />
          </div>

          <div
            style={{
              color: '#9a6b2f',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            SOCIAL LOGIN
          </div>

          <p
            style={{
              margin: '0 0 12px',
              color: '#7a6753',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            구글, 네이버, 카카오 계정으로 바로 로그인할 수 있습니다.
          </p>

          <AuthGateway next={next} mode="login" />

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
            }}
          >
            <span style={{ color: '#8d7760' }}>아직 계정이 없으신가요?</span>
            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              style={{
                color: '#2f2417',
                textDecoration: 'none',
                fontWeight: 900,
              }}
            >
              회원가입
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}