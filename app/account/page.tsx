import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function firstString(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0) || ''
}

export default async function AccountPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login?next=/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, username, email, phone_number, gender, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = firstString(
    profile?.full_name,
    profile?.username,
    user.user_metadata?.full_name,
    user.user_metadata?.name,
    user.email?.split('@')[0],
    '사용자'
  )

  const email = firstString(profile?.email, user.email, '-')
  const phone = firstString(profile?.phone_number, '-')
  const username = firstString(profile?.username, '-')
  const gender = firstString(profile?.gender, '-')
  const role = firstString(profile?.role, 'user')

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '24px 20px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <section
          style={{
            borderRadius: 28,
            padding: 28,
            background: 'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
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
            ACCOUNT
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.15,
              fontWeight: 900,
            }}
          >
            계정
          </h1>

          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'grid',
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 22,
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
            padding: 18,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <InfoRow label="이름" value={displayName} />
          <InfoRow label="이메일" value={email} />
          <InfoRow label="연락처" value={phone} />
          <InfoRow label="아이디" value={username} />
          <InfoRow label="성별" value={gender} />
          <InfoRow label="권한" value={role} />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <Link href="/my/listings" style={actionLinkStyle}>
            내 매물
          </Link>
          <Link href="/my/deals" style={actionLinkStyle}>
            내 거래
          </Link>
          <Link href="/listings/create" style={actionLinkStyle}>
            자산 등록
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

const actionLinkStyle: React.CSSProperties = {
  minHeight: 52,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #eadfcf',
  color: '#2f2417',
  textDecoration: 'none',
  fontWeight: 800,
  boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
}