import Link from 'next/link'
import type { CSSProperties } from 'react'
import { signupAction } from './actions'

export const dynamic = 'force-dynamic'

function pickFirst(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] || ''
  return ''
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = (await searchParams) ?? {}
  const error = pickFirst(resolved.error)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '40px 16px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 28,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
            display: 'grid',
            gap: 14,
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
            SIGN UP
          </div>

          <h1
            style={{
              margin: 0,
              color: '#241b11',
              fontSize: 38,
              lineHeight: 1.15,
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            회원가입
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6d5a47',
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            Msell 계정을 만들고 거래 등록, 거래 문의, 내 거래 관리를 시작하세요.
          </p>
        </section>

        {error ? (
          <div
            style={{
              background: '#fff4f1',
              border: '1px solid #efc6bc',
              color: '#8b3a2a',
              borderRadius: 18,
              padding: '14px 16px',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 28,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
          }}
        >
          <form action={signupAction} style={{ display: 'grid', gap: 16 }}>
            <div className="signup-grid" style={gridStyle}>
              <Field
                label="이름"
                name="full_name"
                placeholder="이름을 입력하세요"
                required
              />
              <Field
                label="사용자명"
                name="username"
                placeholder="영문/숫자/언더스코어"
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
              />
              <Field
                label="이메일"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Field
                label="비밀번호"
                name="password"
                type="password"
                placeholder="6자 이상 입력"
                required
              />
              <Field
                label="비밀번호 확인"
                name="password_confirm"
                type="password"
                placeholder="비밀번호를 다시 입력"
                required
              />
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
              회원가입 후 이메일/비밀번호 로그인 또는 소셜 로그인 흐름과 함께 프로필이 동기화됩니다.
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
      </div>

      <style>{`
        @media (max-width: 860px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  inputMode,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  required?: boolean
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
        inputMode={inputMode}
        required={required}
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

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 16,
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 48,
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
  height: 46,
  padding: '0 18px',
  borderRadius: 999,
  border: '1px solid #2f2417',
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 800,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  height: 44,
  padding: '0 16px',
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