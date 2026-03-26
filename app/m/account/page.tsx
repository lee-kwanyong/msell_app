import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export default async function MobileAccountPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/m/auth/login?next=/m/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const displayName =
    profile?.full_name ||
    profile?.username ||
    user.user_metadata?.full_name ||
    user.email ||
    '사용자'

  const email = profile?.email || user.email || ''
  const phone = profile?.phone_number || ''
  const username = profile?.username || ''
  const gender = profile?.gender || ''

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '18px 14px 120px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          style={{
            borderRadius: 24,
            padding: 22,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255,248,236,0.78)',
              marginBottom: 8,
            }}
          >
            MY ACCOUNT
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.18,
              fontWeight: 900,
            }}
          >
            마이페이지
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255,248,236,0.82)',
            }}
          >
            계정 정보와 주요 이동 링크를 모바일 기준으로 한 번에 정리했습니다.
          </p>

          <div
            style={{
              marginTop: 16,
              padding: '16px',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'grid',
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#fffaf2',
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(255,248,236,0.78)',
                wordBreak: 'break-all',
              }}
            >
              {email}
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 22,
            padding: 16,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <InfoRow label="이름" value={String(displayName)} />
          <InfoRow label="이메일" value={String(email || '-')} />
          <InfoRow label="연락처" value={String(phone || '-')} />
          <InfoRow label="아이디" value={String(username || '-')} />
          <InfoRow label="성별" value={String(gender || '-')} />
        </section>

        <section
          style={{
            display: 'grid',
            gap: 10,
          }}
        >
          <Link href="/account" style={primaryLinkStyle}>
            계정 정보 수정
          </Link>
          <Link href="/m/my/listings" style={secondaryLinkStyle}>
            내 자산 보기
          </Link>
          <Link href="/m/my/deals" style={secondaryLinkStyle}>
            내 거래방 보기
          </Link>
          <Link href="/m/listings/create" style={secondaryLinkStyle}>
            자산 등록하기
          </Link>
          <Link href="/auth/logout" style={dangerLinkStyle}>
            로그아웃
          </Link>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 22,
            padding: 16,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <Link href="/terms" style={smallTextLinkStyle}>
            이용약관
          </Link>
          <Link href="/privacy" style={smallTextLinkStyle}>
            개인정보처리방침
          </Link>
          <Link href="/policy" style={smallTextLinkStyle}>
            운영정책
          </Link>
        </section>
      </div>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 5,
        padding: '13px 14px',
        borderRadius: 16,
        background: '#fbf7f0',
        border: '1px solid #efe4d5',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#8a745b',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#241b11',
          lineHeight: 1.6,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  )
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 50,
  borderRadius: 16,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 15,
}

const secondaryLinkStyle: React.CSSProperties = {
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
  fontSize: 15,
}

const dangerLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 50,
  borderRadius: 16,
  border: '1px solid #f1d0c8',
  background: '#fff4f2',
  color: '#9a3f2d',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 15,
}

const smallTextLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 42,
  color: '#5f4f3f',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 14,
}