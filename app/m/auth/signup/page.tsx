import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'
import { signupAction } from '@/app/auth/signup/actions'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/m'
  if (!input.startsWith('/')) return '/m'
  if (input.startsWith('//')) return '/m'
  return input
}

export default async function MobileSignupPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string
    success?: string
    next?: string
  }>
}) {
  const pageParams = searchParams ? await searchParams : undefined
  const error = pageParams?.error ?? ''
  const success = pageParams?.success ?? ''
  const next = safeNextPath(pageParams?.next)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '24px 14px 88px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 16px 36px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 8,
              }}
            >
              MSELL MOBILE SIGN UP
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.15,
                fontWeight: 900,
                color: '#241b11',
              }}
            >
              모바일 회원가입
            </h1>
          </div>

          {error ? <div style={errorBoxStyle}>{decodeURIComponent(error)}</div> : null}
          {success ? <div style={successBoxStyle}>{decodeURIComponent(success)}</div> : null}

          <form action={signupAction} style={{ display: 'grid', gap: 14 }}>
            <input type="hidden" name="next" value={next} />

            <Field label="이름" required>
              <input type="text" name="full_name" required placeholder="이름" style={inputStyle} />
            </Field>

            <Field label="아이디" required>
              <input
                type="text"
                name="username"
                required
                placeholder="영문/숫자 조합"
                style={inputStyle}
              />
            </Field>

            <Field label="연락처">
              <input
                type="tel"
                name="phone_number"
                placeholder="01012345678"
                style={inputStyle}
              />
            </Field>

            <Field label="성별">
              <select name="gender" defaultValue="" style={inputStyle}>
                <option value="">선택 안 함</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </Field>

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
                minLength={8}
                placeholder="8자 이상"
                style={inputStyle}
              />
            </Field>

            <Field label="비밀번호 확인" required>
              <input
                type="password"
                name="password_confirm"
                required
                minLength={8}
                placeholder="비밀번호를 다시 입력하세요"
                style={inputStyle}
              />
            </Field>

            <button type="submit" style={submitButtonStyle}>
              회원가입하기
            </button>
          </form>

          <div style={dividerWrapStyle}>
            <div style={dividerLineStyle} />
            <span style={dividerTextStyle}>SOCIAL SIGN UP</span>
            <div style={dividerLineStyle} />
          </div>

          <AuthGateway next={next} />

          <div
            style={{
              marginTop: 18,
              textAlign: 'center',
              color: '#6b5845',
              fontSize: 14,
            }}
          >
            이미 계정이 있나요?{' '}
            <Link
              href={`/m/auth/login${next !== '/m' ? `?next=${encodeURIComponent(next)}` : ''}`}
              style={{
                color: '#2f2417',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              로그인
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 50,
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
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#fff4f2',
  border: '1px solid #f1d0c8',
  color: '#9a3f2d',
  fontSize: 14,
  fontWeight: 700,
}

const successBoxStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f4fbf4',
  border: '1px solid #d5ead5',
  color: '#2f6b3d',
  fontSize: 14,
  fontWeight: 700,
}

const dividerWrapStyle: React.CSSProperties = {
  margin: '22px 0 16px',
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