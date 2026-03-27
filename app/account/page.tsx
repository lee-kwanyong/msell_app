import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function firstString(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0) || ''
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'U'
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
  const avatarUrl = firstString(profile?.avatar_url, user.user_metadata?.avatar_url)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f4ef 0%, #f1eee8 100%)',
        padding: '28px 20px 90px',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gap: 18,
        }}
      >
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 34,
            background:
              'radial-gradient(circle at top right, rgba(110,84,49,0.12), transparent 28%), linear-gradient(135deg, #2f2417 0%, #5a4026 100%)',
            color: '#fffaf2',
            boxShadow: '0 24px 48px rgba(47, 36, 23, 0.14)',
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'rgba(255,248,236,0.76)',
            }}
          >
            ACCOUNT
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  color: '#fffaf2',
                  fontSize: 28,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="프로필"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitial(displayName)
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 38,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    color: '#fffaf2',
                  }}
                >
                  계정
                </h1>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 26,
                    lineHeight: 1.2,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#fffaf2',
                    wordBreak: 'break-word',
                  }}
                >
                  {displayName}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontWeight: 700,
                    color: 'rgba(255,248,236,0.74)',
                    wordBreak: 'break-all',
                  }}
                >
                  {email}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 38,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fffaf2',
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {role}
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
            gap: 16,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
              border: '1px solid rgba(60,42,23,0.08)',
              borderRadius: 28,
              padding: 18,
              boxShadow: '0 16px 36px rgba(34,24,16,0.05)',
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
          </div>

          <div
            style={{
              display: 'grid',
              gap: 12,
              alignContent: 'start',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(180deg, #fffdfa 0%, #f8f5ef 100%)',
                border: '1px solid rgba(60,42,23,0.08)',
                borderRadius: 28,
                padding: 18,
                boxShadow: '0 16px 36px rgba(34,24,16,0.05)',
                display: 'grid',
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
            </div>
          </div>
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
        gap: 6,
        padding: '15px 16px',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(60,42,23,0.06)',
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
          fontSize: 15,
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
  minHeight: 54,
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