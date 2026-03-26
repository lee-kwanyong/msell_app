import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'
import { loginAction } from '@/app/auth/login/actions'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/m'
  if (!input.startsWith('/')) return '/m'
  if (input.startsWith('//')) return '/m'
  return input
}

export default async function MobileLoginPage({
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
  const next = safeNextPath(pageParams?.next)

  const successText =
    success ||
    (message === 'signup_success' ? '회원가입이 완료되었습니다. 로그인해 주세요.' : '')

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '20px 14px 92px',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          style={{
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255, 248, 236, 0.78)',
              marginBottom: 8,
            }}
          >
            MSELL MOBILE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.18,
              fontWeight: 900,
            }}
          >
            빠르게 로그인하고
            <br />
            바로 거래로 이동하세요
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255, 248, 236, 0.82)',
            }}
          >
            모바일에서는 로그인 후 바로 원하는 화면으로 돌아가는 흐름이 가장 중요합니다.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gap: 8,
            }}
          >
            <MiniInfo text={`복귀 경로: ${next}`} />
            <MiniInfo text="지원 로그인: Google / Naver" />
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 8,
              }}
            >
              LOGIN
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.15,
                color: '#241b11',
                fontWeight: 900,
              }}
            >
              모바일 로그인
            </h2>
          </div>

          {error ? <div style={errorBoxStyle}>{decodeURIComponent(error)}</div> : null}
          {successText ? (
            <div style={successBoxStyle}>{decodeURIComponent(successText)}</div>
          ) : null}

          <form action={loginAction} style={{ display: 'grid', gap: 14 }}>
            <input type="hidden" name="next" value={next} />

            <Field label="이메일" required>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </Field>

            <Field label="비밀번호" required>
              <input
                type="password"
                name="password"
                required
                placeholder="비밀번호를 입력하세요"
                style={inputStyle}
              />
            </Field>

            <button type="submit" style={submitButtonStyle}>
              이메일로 로그인
            </button>
          </form>

          <div style={dividerWrapStyle}>
            <div style={dividerLineStyle} />
            <span style={dividerTextStyle}>SOCIAL LOGIN</span>
            <div style={dividerLineStyle} />
          </div>

          <AuthGateway next={next} />

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
                color: '#6b5845',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              아직 계정이 없다면 아래에서 회원가입을 진행하세요.
            </div>

            <Link
              href={`/m/auth/signup${next !== '/m' ? `?next=${encodeURIComponent(next)}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #e4d6c2',
                background: '#fffaf4',
                color: '#241b11',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              회원가입으로 이동
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#241b11',
        }}
      >
        {label}
        {required ? <span style={{ color: '#9a3f2d', marginLeft: 4 }}>*</span> : null}
      </span>
      {children}
    </label>
  )
}

function MiniInfo({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '11px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 13,
        fontWeight: 700,
        color: 'rgba(255,248,236,0.86)',
        wordBreak: 'break-all',
      }}
    >
      {text}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  borderRadius: 14,
  border: '1px solid #e5d7c3',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
}

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  borderRadius: 16,
  border: 'none',
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
}

const errorBoxStyle: React.CSSProperties = {
  marginBottom: 14,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#fff4f2',
  border: '1px solid #f1d0c8',
  color: '#9a3f2d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}

const successBoxStyle: React.CSSProperties = {
  marginBottom: 14,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f4fbf4',
  border: '1px solid #d5ead5',
  color: '#2f6b3d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}

const dividerWrapStyle: React.CSSProperties = {
  margin: '20px 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#eadfcf',
}

const dividerTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#8a745b',
}