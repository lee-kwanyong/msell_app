import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  id?: string | null
  email?: string | null
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
  role?: string | null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function getInitial(text: string) {
  return (text || 'U').slice(0, 1).toUpperCase()
}

function getProviderLabel(provider?: string | null) {
  switch (provider) {
    case 'google':
      return 'Google 로그인'
    case 'kakao':
      return 'Kakao 로그인'
    case 'naver':
    case 'custom:naver':
      return 'Naver 로그인'
    case 'email':
      return '이메일 로그인'
    default:
      return '로그인'
  }
}

export default async function Header() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: ProfileRow | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, username, avatar_url, role')
      .eq('id', user.id)
      .maybeSingle()

    profile = (data as ProfileRow | null) ?? null
  }

  const displayName = firstString(
    profile?.full_name,
    profile?.username,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    user?.user_metadata?.nickname,
    user?.user_metadata?.preferred_username,
    user?.email?.split('@')[0]
  )

  const displayEmail = firstString(profile?.email, user?.email)

  const avatarUrl = firstString(
    profile?.avatar_url,
    user?.user_metadata?.avatar_url,
    user?.user_metadata?.picture
  )

  const provider = firstString(
    user?.app_metadata?.provider,
    user?.user_metadata?.provider
  )

  const providerLabel = getProviderLabel(provider)
  const isAdmin = profile?.role === 'admin'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(14px)',
        background: 'rgba(246, 241, 231, 0.86)',
        borderBottom: '1px solid #eadfcf',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: '#241b11',
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
            }}
          >
            Msell
          </Link>

          <nav
            className="msell-header-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/" style={navButtonStyle}>
              홈
            </Link>
            <Link href="/listings" style={navButtonStyle}>
              거래목록
            </Link>
            {user ? (
              <>
                <Link href="/my/listings" style={navButtonStyle}>
                  내 매물
                </Link>
                <Link href="/my/deals" style={navButtonStyle}>
                  내 거래
                </Link>
                <Link href="/account" style={navButtonStyle}>
                  계정
                </Link>
                {isAdmin ? (
                  <Link href="/admin" style={navButtonStyle}>
                    관리자
                  </Link>
                ) : null}
              </>
            ) : null}
          </nav>
        </div>

        <div
          className="msell-header-user"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {user ? (
            <>
              <Link
                href="/account"
                style={{
                  textDecoration: 'none',
                  color: '#2f2417',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#fffaf2',
                    border: '1px solid #ddcfba',
                    borderRadius: 999,
                    padding: '8px 12px 8px 8px',
                    minWidth: 0,
                    maxWidth: 340,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#2f2417',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 14,
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
                      getInitial(displayName || displayEmail || 'U')
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      display: 'grid',
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#241b11',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayName || '회원'}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#8a7458',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {providerLabel}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#8a7458',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      연결 이메일: {displayEmail || '없음'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/auth/logout" style={primaryButtonStyle}>
                로그아웃
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={navButtonStyle}>
                로그인
              </Link>
              <Link href="/auth/signup" style={primaryButtonStyle}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .msell-header-nav {
            display: none !important;
          }

          .msell-header-user {
            gap: 8px !important;
          }
        }

        @media (max-width: 640px) {
          .msell-header-user a[href="/account"] > div {
            max-width: 200px !important;
          }
        }
      `}</style>
    </header>
  )
}

const navButtonStyle: React.CSSProperties = {
  height: 40,
  padding: '0 14px',
  borderRadius: 999,
  border: '1px solid #ddcfba',
  background: '#fffaf2',
  color: '#2f2417',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 800,
  whiteSpace: 'nowrap',
}

const primaryButtonStyle: React.CSSProperties = {
  height: 40,
  padding: '0 14px',
  borderRadius: 999,
  border: '1px solid #2f2417',
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 800,
  whiteSpace: 'nowrap',
}