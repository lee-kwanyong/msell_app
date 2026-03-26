import Link from 'next/link'
import type { CSSProperties } from 'react'
import { loginAction } from './actions'
import AuthGateway from '@/components/auth/AuthGateway'

export const dynamic = 'force-dynamic'

function pickFirst(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] || ''
  return ''
}

function safeNextPath(input: string) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

function MessageBox({
  tone,
  children,
}: {
  tone: 'error' | 'success'
  children: React.ReactNode
}) {
  const isError = tone === 'error'

  return (
    <div
      style={{
        background: isError ? '#fff4f1' : '#f4efe6',
        border: `1px solid ${isError ? '#efc6bc' : '#ddcfba'}`,
        color: isError ? '#8b3a2a' : '#2f2417',
        borderRadius: 18,
        padding: '14px 16px',
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          color: '#7a654d',
          fontWeight: 800,
        }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </label>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = (await searchParams) ?? {}

  const error = pickFirst(resolved.error)
  const message = pickFirst(resolved.message)
  const next = safeNextPath(pickFirst(resolved.next))

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
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(380px, 0.95fr)',
          gap: 24,
          alignItems: 'start',
        }}
        className="login-shell"
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 32,
            padding: 32,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
            display: 'grid',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 'fit-content',
              minHeight: 34,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 14px',
              borderRadius: 999,
              background: '#f1e6d7',
              color: '#7a664d',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            MSELL LOGIN
          </div>

          <h1
            style={{
              margin: 0,
              color: '#241b11',
              fontSize: 44,
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            로그인
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6d5a47',
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 620,
            }}
          >
            기존 회원은 이메일과 비밀번호로 바로 로그인할 수 있고, 처음 방문한 사용자는 구글·네이버·카카오로 간편하게 시작할 수 있습니다.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
            }}
            className="login-feature-grid"
          >
            <div style={featureCardStyle}>
              <div style={featureTitleStyle}>기존 회원</div>
              <div style={featureTextStyle}>이메일 로그인 지원</div>
            </div>
            <div style={featureCardStyle}>
              <div style={featureTitleStyle}>간편 시작</div>
              <div style={featureTextStyle}>네이버·구글·카카오</div>
            </div>
            <div style={featureCardStyle}>
              <div style={featureTitleStyle}>자동 연동</div>
              <div style={featureTextStyle}>프로필 정보 동기화</div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 32,
            padding: 24,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
            display: 'grid',
            gap: 16,
          }}
        >
          {error ? <MessageBox tone="error">{decodeURIComponent(error)}</MessageBox> : null}
          {message ? <MessageBox tone="success">{decodeURIComponent(message)}</MessageBox> : null}

          <div style={{ display: 'grid', gap: 8 }}>
            <div
              style={{
                fontSize: 13,
                color: '#8a7357',
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              EMAIL LOGIN
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#241b11',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              이메일 로그인
            </div>
            <p
              style={{
                margin: 0,
                color: '#7c6955',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              이미 가입한 회원은 이메일과 비밀번호를 입력해 바로 로그인하세요.
            </p>
          </div>

          <form action={loginAction} style={{ display: 'grid', gap: 14 }}>
            <input type="hidden" name="next" value={next} />

            <Field
              label="이메일"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Field
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />

            <button type="submit" style={primaryButtonStyle}>
              이메일로 로그인
            </button>
          </form>

          <div
            style={{
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              margin: '6px 0',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 1,
                background: '#eadfcf',
                transform: 'translateY(-50%)',
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '0 12px',
                background: '#ffffff',
                color: '#9a8265',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              OR
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div
              style={{
                fontSize: 13,
                color: '#8a7357',
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              SOCIAL LOGIN
            </div>

            <AuthGateway next={next} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              paddingTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: '#7c6955',
              }}
            >
              아직 계정이 없으신가요?
            </span>

            <Link href="/auth/signup" style={inlineLinkStyle}>
              회원가입
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .login-shell {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .login-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 50,
  borderRadius: 14,
  border: '1px solid #ddcfba',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryButtonStyle: CSSProperties = {
  height: 48,
  padding: '0 18px',
  borderRadius: 999,
  border: '1px solid #2f2417',
  background: '#2f2417',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const inlineLinkStyle: CSSProperties = {
  color: '#2f2417',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 900,
}

const featureCardStyle: CSSProperties = {
  background: '#fbf7ef',
  border: '1px solid #eadfcf',
  borderRadius: 20,
  padding: '16px 16px',
  display: 'grid',
  gap: 6,
}

const featureTitleStyle: CSSProperties = {
  fontSize: 12,
  color: '#8a7357',
  fontWeight: 800,
  letterSpacing: '0.05em',
}

const featureTextStyle: CSSProperties = {
  fontSize: 16,
  color: '#241b11',
  fontWeight: 900,
  lineHeight: 1.4,
}