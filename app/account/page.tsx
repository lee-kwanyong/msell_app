import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { CSSProperties } from 'react'
import { supabaseServer } from '@/lib/supabase/server'
import { updateAccountAction } from './actions'

export const dynamic = 'force-dynamic'

type ProfileRow = {
  id?: string | null
  email?: string | null
  full_name?: string | null
  username?: string | null
  phone_number?: string | null
  gender?: string | null
  role?: string | null
  is_banned?: boolean | null
  avatar_url?: string | null
  provider?: string | null
  created_at?: string | null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function getRoleLabel(role?: string | null) {
  switch (role) {
    case 'admin':
      return '관리자'
    case 'operator':
      return '운영자'
    case 'member':
      return '일반회원'
    default:
      return '회원'
  }
}

function getProviderLabel(provider?: string | null) {
  switch (provider) {
    case 'google':
      return 'Google'
    case 'kakao':
      return 'Kakao'
    case 'naver':
    case 'custom:naver':
      return 'Naver'
    case 'email':
      return 'Email'
    default:
      return provider || '-'
  }
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        background: '#fbf7ef',
        border: '1px solid #eadfcf',
        borderRadius: 18,
        padding: '16px 18px',
        display: 'grid',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#8a7357',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: '#241b11',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {value || '-'}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: string
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
      <select name={name} defaultValue={defaultValue || ''} style={inputStyle}>
        <option value="">선택 안 함</option>
        <option value="male">남성</option>
        <option value="female">여성</option>
        <option value="other">기타</option>
      </select>
    </label>
  )
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}

  const success = resolvedSearchParams.success
  const errorParam = resolvedSearchParams.error

  const successFlag =
    (typeof success === 'string' && success === '1') ||
    (Array.isArray(success) && success.includes('1'))

  const errorMessage =
    typeof errorParam === 'string'
      ? errorParam
      : Array.isArray(errorParam)
      ? errorParam[0]
      : ''

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const profile = (profileData as ProfileRow | null) ?? null
  const metadata = (user.user_metadata || {}) as Record<string, unknown>

  const email = firstString(
    profile?.email,
    user.email,
    metadata.email
  )

  const fullName = firstString(
    profile?.full_name,
    metadata.full_name,
    metadata.name,
    metadata.nickname
  )

  const username = firstString(
    profile?.username,
    metadata.user_name,
    metadata.preferred_username,
    metadata.username
  )

  const phoneNumber = firstString(
    profile?.phone_number,
    user.phone,
    metadata.phone_number,
    metadata.phone
  )

  const gender = firstString(
    profile?.gender,
    metadata.gender
  )

  const provider = firstString(
    profile?.provider,
    user.app_metadata?.provider,
    metadata.provider
  )

  const avatarUrl = firstString(
    profile?.avatar_url,
    metadata.avatar_url,
    metadata.picture
  )

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
          maxWidth: 1160,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <section
          className="account-hero-grid"
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 28,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
            gap: 20,
          }}
        >
          <div style={{ display: 'grid', gap: 14 }}>
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
              ACCOUNT
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
              계정 정보
            </h1>

            <p
              style={{
                margin: 0,
                color: '#6d5a47',
                fontSize: 16,
                lineHeight: 1.85,
                maxWidth: 720,
              }}
            >
              소셜 로그인 이후 동기화된 값을 확인하고, 필요한 항목은 직접 수정해서 저장할 수 있습니다.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/my/listings" style={secondaryButtonStyle}>
                내 매물
              </Link>
              <Link href="/my/deals" style={secondaryButtonStyle}>
                내 거래
              </Link>
            </div>
          </div>

          <div
            style={{
              background: '#fbf7ef',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: 20,
              display: 'grid',
              gap: 14,
              alignContent: 'start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#2f2417',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 26,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="프로필"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  (fullName || username || email || 'U').slice(0, 1).toUpperCase()
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#241b11',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {fullName || username || '이름 미등록'}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#7c6955',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {email || '이메일 없음'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              <MiniStat label="로그인 방식" value={getProviderLabel(provider)} />
              <MiniStat label="권한" value={getRoleLabel(profile?.role)} />
              <MiniStat label="계정 상태" value={profile?.is_banned ? '정지' : '정상'} />
              <MiniStat label="가입 시각" value={formatDate(user.created_at)} />
            </div>
          </div>
        </section>

        {successFlag ? (
          <div
            style={{
              background: '#f4efe6',
              border: '1px solid #ddcfba',
              color: '#2f2417',
              borderRadius: 18,
              padding: '14px 16px',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            계정 정보가 저장되었습니다.
          </div>
        ) : null}

        {errorMessage ? (
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
            {decodeURIComponent(errorMessage)}
          </div>
        ) : null}

        <section
          className="account-info-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          <InfoCard label="이름" value={fullName || '-'} />
          <InfoCard label="닉네임 / 사용자명" value={username || '-'} />
          <InfoCard label="이메일" value={email || '-'} />
          <InfoCard label="연락처" value={phoneNumber || '-'} />
          <InfoCard label="성별" value={gender || '-'} />
          <InfoCard label="프로필 생성일" value={formatDate(profile?.created_at)} />
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 24,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
            display: 'grid',
            gap: 18,
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                color: '#241b11',
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              계정 수정
            </h2>
            <p
              style={{
                margin: 0,
                color: '#7c6955',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              소셜 로그인으로 들어온 값이 비어 있거나 어색하면 여기서 직접 수정해 저장하면 됩니다.
            </p>
          </div>

          <form action={updateAccountAction} style={{ display: 'grid', gap: 16 }}>
            <div
              className="account-form-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              <Field
                label="이름"
                name="full_name"
                defaultValue={fullName}
                placeholder="이름을 입력하세요"
              />

              <Field
                label="사용자명"
                name="username"
                defaultValue={username}
                placeholder="영문/숫자/언더스코어"
              />

              <Field
                label="연락처"
                name="phone_number"
                defaultValue={phoneNumber}
                placeholder="연락처를 입력하세요"
              />

              <SelectField
                label="성별"
                name="gender"
                defaultValue={gender}
              />
            </div>

            <div
              style={{
                background: '#fbf7ef',
                border: '1px solid #eadfcf',
                borderRadius: 20,
                padding: 16,
                display: 'grid',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#8b7458',
                  fontWeight: 800,
                }}
              >
                로그인 이메일
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: '#241b11',
                  fontWeight: 900,
                  wordBreak: 'break-word',
                }}
              >
                {email || '-'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8b7458',
                  lineHeight: 1.6,
                }}
              >
                이메일은 현재 로그인 계정 기준으로 표시되며 여기서는 수정하지 않습니다.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" style={primaryButtonStyle}>
                저장하기
              </button>
              <Link href="/" style={secondaryButtonStyle}>
                홈으로
              </Link>
            </div>
          </form>
        </section>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .account-hero-grid,
          .account-info-grid,
          .account-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eadfcf',
        borderRadius: 16,
        padding: '14px 14px 12px',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#8b7458',
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          color: '#241b11',
          fontWeight: 900,
          lineHeight: 1.45,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  )
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