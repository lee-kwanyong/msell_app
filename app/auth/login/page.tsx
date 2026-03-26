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
  const success = pickFirst(resolved.success)
  const next = safeNextPath(pickFirst(resolved.next))

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '56px 16px 96px',
        display: 'grid',
        placeItems: 'start center',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          border: '1px solid #eadfcf',
          borderRadius: 34,
          padding: 28,
          boxShadow: '0 16px 40px rgba(47,36,23,0.06)',
          display: 'grid',
          gap: 18,
        }}
      >
        {error ? <MessageBox tone="error">{decodeURIComponent(error)}</MessageBox> : null}
        {message ? <MessageBox tone="success">{decodeURIComponent(message)}</MessageBox> : null}
        {success === 'logout' ? <MessageBox tone="success">정상적으로 로그아웃되었습니다.</MessageBox> : null}

        <div style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              fontSize: 13,
              color: '#8a7357',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            EMAIL LOGIN
          </div>
          <div
            style={{
              fontSize: 34,
              color: '#241b11',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            이메일 로그인
          </div>
          <p
            style={{
              margin: 0,
              color: '#7c6955',
              fontSize: 14,
              lineHeight: 1.75,
              wordBreak: 'keep-all',
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
            margin: '4px 0',
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

          <p
            style={{
              margin: 0,
              color: '#7c6955',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            구글, 네이버, 카카오 계정으로 바로 로그인할 수 있습니다.
          </p>

          <AuthGateway next={next} mode="login" />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            paddingTop: 2,
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
    </main>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 52,
  borderRadius: 15,
  border: '1px solid #ddcfba',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryButtonStyle: CSSProperties = {
  height: 50,
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