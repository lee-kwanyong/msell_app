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
    <header className="msell-header-shell">
      <div className="msell-header">
        <Link href="/" className="msell-brand">
          <span className="msell-brand-mark">M</span>
          <span className="msell-brand-text">Msell</span>
        </Link>

        <nav className="msell-nav" aria-label="주요 메뉴">
          <Link href="/" className="msell-nav-link">
            홈
          </Link>
          <Link href="/listings" className="msell-nav-link">
            자산목록
          </Link>
          <Link href="/listings/create" className="msell-nav-link">
            자산등록
          </Link>

          {user ? (
            <>
              <Link href="/my/listings" className="msell-nav-link">
                내 자산
              </Link>
              <Link href="/my/deals" className="msell-nav-link">
                내 거래
              </Link>
              <Link href="/notifications" className="msell-nav-link msell-nav-link-badge">
                알림
                {unreadCount > 0 ? (
                  <span className="msell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                ) : null}
              </Link>
              <Link href="/account" className="msell-nav-link">
                계정
              </Link>
            </>
          ) : null}
        </nav>

        <div className="msell-header-actions">
          {user ? (
            <Link href="/auth/logout" className="msell-btn msell-btn-primary">
              로그아웃
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="msell-btn msell-btn-secondary">
                로그인
              </Link>
              <Link href="/auth/signup" className="msell-btn msell-btn-primary">
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
        <div className="msell-app-bg">
          <Header />
          <div className="msell-page-shell">{children}</div>
        </div>
      </body>
    </html>
  )
}