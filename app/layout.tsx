import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { supabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Msell',
  description: 'Digital Asset Marketplace',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ProfileRow = {
  role?: string | null
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        height: 40,
        padding: '0 16px',
        borderRadius: 999,
        border: active ? 'none' : '1px solid #ddcfba',
        background: active ? '#2f2417' : '#fffaf2',
        color: active ? '#ffffff' : '#2f2417',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false

  if (user) {
    const [{ data: profile }, { data: rpcIsAdmin }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])

    const me = (profile as ProfileRow | null) ?? null
    isAdmin = rpcIsAdmin === true || me?.role === 'admin'
  }

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: '#f6f1e7',
          color: '#241b11',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(246, 241, 231, 0.92)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid #e8dccb',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '18px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                color: '#241b11',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#2f2417',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                M
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#241b11',
                  }}
                >
                  Msell
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#7a6752',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  DIGITAL ASSET MARKETPLACE
                </div>
              </div>
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              <NavLink href="/listings">거래목록</NavLink>
              <NavLink href="/listings/create">등록하기</NavLink>

              {user ? (
                <>
                  <NavLink href="/my/listings">내 자산</NavLink>
                  <NavLink href="/my/deals">내 거래</NavLink>
                  <NavLink href="/account">계정</NavLink>

                  {isAdmin ? <NavLink href="/admin">어드민</NavLink> : null}

                  <form
                    action="/auth/logout"
                    method="post"
                    style={{ margin: 0 }}
                  >
                    <button
                      type="submit"
                      style={{
                        height: 40,
                        padding: '0 16px',
                        borderRadius: 999,
                        border: 'none',
                        background: '#2f2417',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <NavLink href="/auth/login">로그인</NavLink>
                  <NavLink href="/auth/signup" active>
                    회원가입
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </header>

        <div>{children}</div>
      </body>
    </html>
  )
}