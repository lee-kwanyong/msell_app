import Link from 'next/link'
import type { CSSProperties } from 'react'
import { signupAction } from './actions'

export const dynamic = 'force-dynamic'

function pickFirst(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] || ''
  return ''
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
  required,
  inputMode,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
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
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
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
      <select name={name} style={inputStyle}>
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = (await searchParams) ?? {}
  const error = pickFirst(resolved.error)
  const message = pickFirst(resolved.message)

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
          maxWidth: 560,
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

        <div style={{ display: 'grid', gap: 8 }}>
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
            SIGN UP
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
            회원가입
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
            회원가입은 이메일 기준으로 진행합니다. 소셜 계정은 로그인 페이지에서 바로 로그인용으로만 사용합니다.
          </p>
        </div>

        <form action={signupAction} style={{ display: 'grid', gap: 14 }}>
          <div
            className="signup-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            <Field
              label="이름"
              name="full_name"
              placeholder="이름을 입력하세요"
              required
              autoComplete="name"
            />

            <Field
              label="사용자명"
              name="username"
              placeholder="영문/숫자/언더스코어"
              autoComplete="username"
            />

            <SelectField
              label="성별"
              name="gender"
              options={[
                { value: '', label: '선택 안 함' },
                { value: 'male', label: '남성' },
                { value: 'female', label: '여성' },
                { value: 'other', label: '기타' },
              ]}
            />

            <Field
              label="연락처"
              name="phone_number"
              placeholder="01012345678"
              inputMode="tel"
              autoComplete="tel"
            />

            <Field
              label="이메일"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Field
              label="비밀번호"
              name="password"
              type="password"
              placeholder="6자 이상 입력"
              required
              autoComplete="new-password"
            />

            <div style={{ gridColumn: '1 / -1' }}>
              <Field
                label="비밀번호 확인"
                name="password_confirm"
                type="password"
                placeholder="비밀번호를 다시 입력"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div
            style={{
              background: '#fbf7ef',
              border: '1px solid #eadfcf',
              borderRadius: 20,
              padding: 16,
              color: '#7a654d',
              fontSize: 13,
              lineHeight: 1.75,
            }}
          >
            가입 후에는 이메일/비밀번호 로그인으로 사용할 수 있습니다. 구글, 네이버, 카카오는 로그인 페이지에서만 사용합니다.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" style={primaryButtonStyle}>
              회원가입
            </button>
            <Link href="/auth/login" style={secondaryButtonStyle}>
              로그인으로
            </Link>
          </div>
        </form>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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

const secondaryButtonStyle: CSSProperties = {
  height: 48,
  padding: '0 18px',
  borderRadius: 999,
  border: '1px solid #ddcfba',
  background: '#fffaf2',
  color: '#2f2417',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 800,
  whiteSpace: 'nowrap',
}