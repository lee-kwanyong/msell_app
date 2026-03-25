import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'
import { loginAction } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string
    success?: string
    message?: string
    next?: string
  }>
}) {
  const pageParams = searchParams ? await searchParams : undefined
  const error = pageParams?.error ?? ''
  const success = pageParams?.success ?? ''
  const message = pageParams?.message ?? ''
  const next = pageParams?.next ?? '/'

  const successText =
    message === 'signup_success'
      ? '회원가입이 완료되었습니다. 로그인해 주세요.'
      : success

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '48px 16px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 28,
            padding: 32,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 10,
              }}
            >
              MSELL LOGIN
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.15,
                fontWeight: 900,
                color: '#241b11',
              }}
            >
              로그인
            </h1>

            <p
              style={{
                margin: '12px 0 0',
                fontSize: 14,
                lineHeight: 1.7,
                color: '#6a5743',
              }}
            >
              이메일 로그인 또는 소셜 로그인으로 바로 시작하세요.
            </p>
          </div>

          {error ? (
            <div
              style={{
                marginBottom: 16,
                padding: '14px 16px',
                borderRadius: 14,
                background: '#fff4f2',
                border: '1px solid #f1d0c8',
                color: '#9a3f2d',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {decodeURIComponent(error)}
            </div>
          ) : null}

          {successText ? (
            <div
              style={{
                marginBottom: 16,
                padding: '14px 16px',
                borderRadius: 14,
                background: '#f4fbf4',
                border: '1px solid #d5ead5',
                color: '#2f6b3d',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {decodeURIComponent(successText)}
            </div>
          ) : null}

          <form
            action={loginAction}
            style={{
              display: 'grid',
              gap: 16,
            }}
          >
            <input type="hidden" name="next" value={next} />

            <Field label="이메일">
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </Field>

            <Field label="비밀번호">
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                required
                autoComplete="current-password"
                style={inputStyle}
              />
            </Field>

            <button type="submit" style={primaryButtonStyle}>
              이메일로 로그인
            </button>
          </form>

          <div
            style={{
              margin: '22px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#efe4d4' }} />
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#8b7355',
                letterSpacing: '0.04em',
              }}
            >
              SOCIAL LOGIN
            </div>
            <div style={{ flex: 1, height: 1, background: '#efe4d4' }} />
          </div>

          <AuthGateway next={next} />

          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: '1px solid #f1e7d8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: '#6a5743',
              }}
            >
              아직 계정이 없나요?
            </span>

            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '0 16px',
                borderRadius: 12,
                background: '#eadfcf',
                color: '#2f2417',
                fontSize: 14,
                fontWeight: 800,
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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#2f2417',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  borderRadius: 14,
  border: '1px solid #ddcfba',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  border: 'none',
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
}