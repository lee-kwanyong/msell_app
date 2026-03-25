import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

type ListingRow = {
  id: string
  title: string | null
  category: string | null
  price: number | null
  status: string | null
  description: string | null
}

function formatPrice(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return '가격 협의'
  return `₩${value.toLocaleString('ko-KR')}`
}

function statusLabel(status: string | null) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'reserved':
      return '예약중'
    case 'sold':
      return '거래종료'
    case 'draft':
      return '임시저장'
    case 'hidden':
      return '숨김'
    case 'pending_review':
      return '검토대기'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관됨'
    default:
      return '상태확인'
  }
}

function summarize(text: string | null | undefined) {
  if (!text) return '등록된 설명이 없습니다.'
  return text.length > 80 ? `${text.slice(0, 80)}...` : text
}

export default async function MobileListingsPage() {
  const supabase = await supabaseServer()

  const { data: listingsRaw } = await supabase
    .from('listings')
    .select('*')
    .in('status', ['active', 'reserved', 'sold'])
    .order('created_at', { ascending: false })

  const listings = ((listingsRaw ?? []) as ListingRow[]).map((item) => ({
    id: item.id,
    title: item.title ?? '제목 없음',
    category: item.category ?? '미분류',
    price: item.price ?? null,
    status: item.status ?? null,
    description: item.description ?? '',
  }))

  return (
    <div style={pageStyle}>
      <section style={heroCardStyle}>
        <div style={badgeStyle}>LISTINGS</div>

        <h1 style={heroTitleStyle}>모바일 거래목록</h1>

        <p style={heroDescStyle}>
          한 손으로 보기 쉬운 카드 흐름으로 등록 자산을 빠르게 탐색할 수 있습니다.
        </p>

        <div style={actionGridStyle}>
          <Link href="/m" style={secondaryButtonStyle}>
            모바일 홈
          </Link>
          <Link href="/listings/create" style={primaryButtonStyle}>
            자산 등록하기
          </Link>
          <Link href="/listings?view=desktop" style={ghostButtonStyle}>
            웹 목록 보기
          </Link>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadStyle}>
          <h2 style={sectionTitleStyle}>등록 자산 {listings.length}개</h2>
        </div>

        <div style={listStyle}>
          {listings.length === 0 ? (
            <div style={emptyCardStyle}>아직 등록된 자산이 없습니다.</div>
          ) : (
            listings.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`} style={cardStyle}>
                <div style={cardTopStyle}>
                  <span style={chipStyle}>{item.category}</span>
                  <span style={softChipStyle}>{statusLabel(item.status)}</span>
                </div>

                <h3 style={cardTitleStyle}>{item.title}</h3>
                <div style={cardPriceStyle}>{formatPrice(item.price)}</div>
                <p style={cardDescStyle}>{summarize(item.description)}</p>

                <div style={cardBottomStyle}>
                  <span>상세 보기</span>
                  <span>→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
}

const heroCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dccfbe',
  borderRadius: 28,
  padding: 24,
  boxShadow: '0 18px 50px rgba(47, 36, 23, 0.08)',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  minHeight: 30,
  alignItems: 'center',
  padding: '0 12px',
  borderRadius: 999,
  background: '#f3ebdf',
  color: '#72593f',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
}

const heroTitleStyle: React.CSSProperties = {
  margin: '16px 0 0',
  fontSize: 30,
  lineHeight: 1.08,
  letterSpacing: '-0.05em',
  color: '#241b11',
  wordBreak: 'keep-all',
}

const heroDescStyle: React.CSSProperties = {
  margin: '14px 0 0',
  color: '#7c6754',
  fontSize: 15,
  lineHeight: 1.7,
  wordBreak: 'keep-all',
}

const actionGridStyle: React.CSSProperties = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 10,
}

const baseButtonStyle: React.CSSProperties = {
  minHeight: 50,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 16px',
  fontSize: 15,
  fontWeight: 800,
  textDecoration: 'none',
}

const primaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#2f2417',
  border: '1px solid #2f2417',
  color: '#ffffff',
}

const secondaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#eadfcf',
  border: '1px solid #eadfcf',
  color: '#2f2417',
}

const ghostButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#ffffff',
  border: '1px solid #dccfbe',
  color: '#2f2417',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const sectionHeadStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  letterSpacing: '-0.03em',
  color: '#241b11',
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dccfbe',
  borderRadius: 24,
  padding: 18,
  boxShadow: '0 18px 50px rgba(47, 36, 23, 0.08)',
  textDecoration: 'none',
}

const cardTopStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  minHeight: 28,
  alignItems: 'center',
  padding: '0 10px',
  borderRadius: 999,
  background: '#f3ebdf',
  color: '#72593f',
  fontSize: 11,
  fontWeight: 800,
}

const softChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  minHeight: 28,
  alignItems: 'center',
  padding: '0 10px',
  borderRadius: 999,
  background: '#f8f5f0',
  color: '#7b6553',
  border: '1px solid #dccfbe',
  fontSize: 11,
  fontWeight: 800,
}

const cardTitleStyle: React.CSSProperties = {
  margin: '14px 0 10px',
  fontSize: 20,
  lineHeight: 1.35,
  letterSpacing: '-0.04em',
  color: '#241b11',
  wordBreak: 'keep-all',
}

const cardPriceStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: '-0.04em',
  color: '#241b11',
}

const cardDescStyle: React.CSSProperties = {
  margin: '12px 0 0',
  color: '#7c6754',
  fontSize: 14,
  lineHeight: 1.65,
}

const cardBottomStyle: React.CSSProperties = {
  marginTop: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#7c6754',
  fontSize: 13,
  fontWeight: 700,
}

const emptyCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dccfbe',
  borderRadius: 24,
  padding: 20,
  color: '#7c6754',
  fontSize: 14,
  boxShadow: '0 18px 50px rgba(47, 36, 23, 0.08)',
}