'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/m', label: '홈', icon: '⌂' },
  { href: '/m/listings', label: '거래', icon: '◫' },
  { href: '/m/listings/create', label: '등록', icon: '+' },
  { href: '/m/my/deals', label: '거래방', icon: '◌' },
  { href: '/m/account', label: '마이', icon: '●' },
]

function isActive(pathname: string, href: string) {
  if (href === '/m') return pathname === '/m'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function BottomTabBar() {
  const pathname = usePathname()

  if (!pathname?.startsWith('/m')) {
    return null
  }

  return (
    <nav
      aria-label="모바일 하단 탭"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        padding: '10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px)',
        background:
          'linear-gradient(to top, rgba(246,241,231,0.98), rgba(246,241,231,0.92))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #eadfcf',
          borderRadius: 22,
          padding: '8px',
          boxShadow: '0 14px 34px rgba(47, 36, 23, 0.10)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 6,
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                minHeight: 58,
                borderRadius: 16,
                textDecoration: 'none',
                display: 'grid',
                placeItems: 'center',
                gap: 4,
                background: active ? '#2f2417' : 'transparent',
                color: active ? '#ffffff' : '#6a5743',
                fontWeight: 800,
                transition: 'all 0.18s ease',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: 11,
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}