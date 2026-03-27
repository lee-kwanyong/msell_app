import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '가격 미정'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return `${numeric.toLocaleString('ko-KR')}원`
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'draft':
      return '임시저장'
    case 'hidden':
      return '숨김'
    case 'sold':
      return '거래종료'
    case 'pending_review':
      return '검수중'
    case 'reserved':
      return '예약중'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관됨'
    default:
      return status || '상태미정'
  }
}

function getShortDescription(value?: string | null) {
  if (!value) return '설명이 아직 없습니다.'
  const cleaned = value.replace(/^\[이전 방식\]\s*.*(\n\n)?/m, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return '설명이 아직 없습니다.'
  return cleaned.length > 90 ? `${cleaned.slice(0, 90)}...` : cleaned
}

export default async function MyListingsPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/my/listings')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = listings ?? []

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
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#8a745b', fontWeight: 800, letterSpacing: '0.08em' }}>
              MY LISTINGS
            </div>
            <h1 style={{ margin: '8px 0 0', fontSize: 34, fontWeight: 900, color: '#241b11' }}>
              내 매물
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/listings/create" style={topButtonPrimary}>
              + 자산 등록
            </Link>
            <Link href="/listings" style={topButtonSecondary}>
              거래목록
            </Link>
          </div>
        </section>

        {items.length === 0 ? (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: 28,
              textAlign: 'center',
              color: '#6a5743',
              boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            }}
          >
            등록된 매물이 없습니다.
          </section>
        ) : (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <article
                  style={{
                    background: '#ffffff',
                    border: '1px solid #eadfcf',
                    borderRadius: 24,
                    padding: 18,
                    boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
                    display: 'grid',
                    gap: 12,
                    minHeight: 240,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={badgeStyle}>{getStatusLabel(item.status)}</span>
                    {item.category ? <span style={categoryBadgeStyle}>{item.category}</span> : null}
                  </div>

                  <div
                    style={{
                      fontSize: 22,
                      lineHeight: 1.35,
                      fontWeight: 900,
                      color: '#241b11',
                    }}
                  >
                    {item.title || '제목 없음'}
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      lineHeight: 1.2,
                      fontWeight: 900,
                      color: '#2f2417',
                    }}
                  >
                    {formatPrice(item.price)}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: '#6f5c48',
                    }}
                  >
                    {getShortDescription(item.description)}
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

const topButtonPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  padding: '0 16px',
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
}

const topButtonSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  padding: '0 16px',
  borderRadius: 14,
  background: '#ffffff',
  border: '1px solid #eadfcf',
  color: '#2f2417',
  textDecoration: 'none',
  fontWeight: 800,
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '0 10px',
  borderRadius: 999,
  background: '#f6efe4',
  color: '#6a5743',
  fontSize: 12,
  fontWeight: 800,
}

const categoryBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '0 10px',
  borderRadius: 999,
  background: '#fbf7f0',
  border: '1px solid #efe4d5',
  color: '#8a745b',
  fontSize: 12,
  fontWeight: 800,
}