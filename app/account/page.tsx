import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { updateAccountAction } from './actions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    success?: string
    error?: string
    welcome?: string
  }>
}

function pickFirstString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export default async function AccountPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
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

  const metadata = user.user_metadata ?? {}
  const identities = Array.isArray(user.identities) ? user.identities : []
  const firstIdentityData =
    identities.find((item: any) => item?.identity_data)?.identity_data ?? {}

  const fullName = pickFirstString(
    profile?.full_name,
    metadata?.full_name,
    metadata?.name,
    metadata?.nickname,
    firstIdentityData?.name,
    firstIdentityData?.full_name,
    firstIdentityData?.nickname,
  )

  const username = pickFirstString(
    profile?.username,
    metadata?.username,
    metadata?.preferred_username,
    metadata?.user_name,
    firstIdentityData?.preferred_username,
    firstIdentityData?.nickname,
    user.email ? user.email.split('@')[0] : '',
  )

  const email = pickFirstString(
    profile?.email,
    user.email,
    metadata?.email,
    firstIdentityData?.email,
  )

  const phoneNumber = pickFirstString(
    profile?.phone_number,
    metadata?.phone_number,
    metadata?.phone,
    user.phone,
    firstIdentityData?.mobile,
    firstIdentityData?.phone_number,
  )

  const gender =
    profile?.gender === 'male' || profile?.gender === 'female'
      ? profile.gender
      : ''

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '28px 16px 48px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1060,
          margin: '0 auto',
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 32,
            padding: '28px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
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
                color: '#8a6a43',
                marginBottom: 10,
              }}
            >
              ACCOUNT SETTINGS
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 54,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: '#20170f',
                fontWeight: 800,
              }}
            >
              계정 수정
            </h1>
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 15,
                lineHeight: 1.8,
                color: '#6b5b4b',
              }}
            >
              이름, 연락처, 성별 등 기본 정보를 수정하세요.
            </p>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 88,
              height: 40,
              padding: '0 16px',
              borderRadius: 16,
              background: '#eadfcf',
              color: '#2f2417',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            마이페이지
          </Link>
        </section>

        {(params.success || params.error || params.welcome) && (
          <section
            style={{
              marginTop: 18,
              borderRadius: 24,
              padding: '16px 18px',
              background: params.error ? '#fff7ed' : '#f5efe4',
              border: params.error
                ? '1px solid #fed7aa'
                : '1px solid #eadfcf',
              color: params.error ? '#9a3412' : '#6b5b4b',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {params.error
              ? decodeURIComponent(params.error)
              : params.success
                ? decodeURIComponent(params.success)
                : '소셜 로그인 정보가 연결되었습니다. 비어 있는 항목을 확인하고 저장해주세요.'}
          </section>
        )}

        <section
          style={{
            marginTop: 18,
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 32,
            padding: 22,
          }}
        >
          <form action={updateAccountAction}>
            <div style={{ display: 'grid', gap: 18 }}>
              <Field label="이름">
                <input
                  name="full_name"
                  defaultValue={fullName}
                  placeholder="이름을 입력하세요"
                  style={inputStyle}
                />
              </Field>

              <Field label="아이디">
                <input
                  name="username"
                  defaultValue={username}
                  placeholder="아이디를 입력하세요"
                  style={inputStyle}
                />
              </Field>

              <Field label="이메일">
                <input
                  value={email}
                  readOnly
                  disabled
                  style={{
                    ...inputStyle,
                    background: '#f4ede2',
                    color: '#7a6958',
                  }}
                />
              </Field>

              <Field label="연락처">
                <input
                  name="phone_number"
                  defaultValue={phoneNumber}
                  placeholder="연락처를 입력하세요"
                  style={inputStyle}
                />
              </Field>

              <Field label="성별">
                <select
                  name="gender"
                  defaultValue={gender}
                  style={inputStyle}
                >
                  <option value="">선택 안 함</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </Field>

              <button
                type="submit"
                style={{
                  height: 52,
                  border: 'none',
                  borderRadius: 16,
                  background: '#2f2417',
                  color: '#fffdf8',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                저장하기
              </button>
            </div>
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
          fontWeight: 700,
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
  height: 46,
  borderRadius: 14,
  border: '1px solid #dbcbb5',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#20170f',
  outline: 'none',
  boxSizing: 'border-box',
}