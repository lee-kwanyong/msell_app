import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { supabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Msell',
  description: 'Digital asset marketplace',
  manifest: '/manifest.webmanifest',
}

async function Header() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let unreadCount = 0

  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    unreadCount = count || 0
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-brand-mark">M</span>
          <span className="site-brand-text">Msell</span>
        </Link>

        <nav className="site-nav" aria-label="주요 메뉴">
          <Link href="/" className="site-nav-link">
            홈
          </Link>
          <Link href="/listings" className="site-nav-link">
            자산목록
          </Link>
          <Link href="/listings/create" className="site-nav-link">
            자산등록
          </Link>

          {user ? (
            <>
              <Link href="/my/listings" className="site-nav-link">
                내 자산
              </Link>
              <Link href="/my/deals" className="site-nav-link">
                내 거래
              </Link>
              <Link href="/notifications" className="site-nav-link site-nav-link-with-badge">
                알림
                {unreadCount > 0 ? (
                  <span className="site-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                ) : null}
              </Link>
              <Link href="/account" className="site-nav-link">
                계정
              </Link>
            </>
          ) : null}
        </nav>

        <div className="site-actions">
          {user ? (
            <Link href="/auth/logout" className="site-btn site-btn-primary">
              로그아웃
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="site-btn site-btn-secondary">
                로그인
              </Link>
              <Link href="/auth/signup" className="site-btn site-btn-primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="site-shell">
          <Header />
          <div className="site-content">{children}</div>
        </div>
      </body>
    </html>
  )
}