import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { supabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Msell',
  description: 'Digital asset marketplace',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user

  return (
    <html lang="ko">
      <body>
        <header className="msell-header-wrap">
          <div className="msell-header-shell">
            <div className="msell-header-inner">
              <Link href="/" className="msell-brand" aria-label="Msell 홈">
                <span className="msell-brand-mark">M</span>
                <span className="msell-brand-text">Msell</span>
              </Link>

              <nav className="msell-nav" aria-label="주 메뉴">
                <Link href="/" className="msell-nav-link">
                  홈
                </Link>
                <Link href="/listings" className="msell-nav-link">
                  자산목록
                </Link>
                <Link href="/listings/create" className="msell-nav-link">
                  자산등록
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link href="/my/listings" className="msell-nav-link">
                      내 자산
                    </Link>
                    <Link href="/my/deals" className="msell-nav-link">
                      내 거래
                    </Link>
                    <Link href="/account" className="msell-nav-link">
                      계정
                    </Link>
                  </>
                ) : null}
              </nav>

              <div className="msell-actions">
                {isLoggedIn ? (
                  <>
                    <Link href="/account" className="msell-btn msell-btn-secondary">
                      계정
                    </Link>
                    <form action="/auth/logout" method="post">
                      <button type="submit" className="msell-btn msell-btn-primary">
                        로그아웃
                      </button>
                    </form>
                  </>
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
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}