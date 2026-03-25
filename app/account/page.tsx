import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { updateAccountAction } from './actions'

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string
    success?: string
  }>
}) {
  const params = searchParams ? await searchParams : undefined
  const error = params?.error ?? ''
  const success = params?.success ?? ''

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, email, phone_number, gender')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '32px 16px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 18,
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 28,
            padding: 28,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a745b',
                  marginBottom: 10,
                }}
              >
                ACCOUNT SETTINGS
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 32,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: '#241b11',
                }}
              >
                계정 수정
              </h1>

              <p
                style={{
                  margin: '12px 0 0',
                  color: '#6a5743',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                이름, 연락처, 성별 등 기본 정보를 수정하세요.
              </p>
            </div>

            <Link href="/my" style={secondaryButtonStyle}>
              마이페이지
            </Link>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 24,
          }}
        >
          {error ? (
            <div style={errorBoxStyle}>{decodeURIComponent(error)}</div>
          ) : null}

          {success ? (
            <div style={successBoxStyle}>{decodeURIComponent(success)}</div>
          ) : null}

          <form action={updateAccountAction} style={{ display: 'grid', gap: 16 }}>
            <Field label="이름">
              <input
                name="full_name"
                defaultValue={profile?.full_name || ''}
                required
                style={inputStyle}
              />
            </Field>

            <Field label="아이디">
              <input
                name="username"
                defaultValue={profile?.username || ''}
                required
                style={inputStyle}
              />
            </Field>

            <Field label="이메일">
              <input
                value={profile?.email || user.email || ''}
                disabled
                style={{ ...inputStyle, background: '#f5efe6', color: '#7a6a55' }}
              />
            </Field>

            <Field label="연락처">
              <input
                name="phone_number"
                defaultValue={profile?.phone_number || ''}
                style={inputStyle}
              />
            </Field>

            <Field label="성별">
              <select
                name="gender"
                defaultValue={profile?.gender || ''}
                style={inputStyle}
              >
                <option value="">선택 안 함</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </Field>

            <button type="submit" style={primaryButtonStyle}>
              저장하기
            </button>
          </form>
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

const secondaryButtonStyle: React.CSSProperties = {
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