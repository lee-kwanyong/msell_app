'use client'

import Link from 'next/link'

export default function BottomTabBar() {
  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
        width: '100%',
        borderTop: '1px solid #eadfcf',
        background: 'rgba(255,255,255,0.94)',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: '#241b11',
            fontWeight: 700,
          }}
        >
          홈
        </Link>

        <Link
          href="/listings"
          style={{
            textDecoration: 'none',
            color: '#241b11',
            fontWeight: 700,
          }}
        >
          거래목록
        </Link>

        <Link
          href="/my/deals"
          style={{
            textDecoration: 'none',
            color: '#241b11',
            fontWeight: 700,
          }}
        >
          내 거래
        </Link>
      </div>
    </nav>
  )
}