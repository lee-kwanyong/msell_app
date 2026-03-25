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
  return text.length > 72 ? `${text.slice(0, 72)}...` : text
}

export default async function MobileHomePage() {
  const supabase = await supabaseServer()

  const { data: listingsRaw } = await supabase
    .from('listings')
    .select('*')
    .in('status', ['active', 'reserved', 'sold'])
    .order('created_at', { ascending: false })
    .limit(6)

  const listings = ((listingsRaw ?? []) as ListingRow[]).map((item) => ({
    id: item.id,
    title: item.title ?? '제목 없음',
    category: item.category ?? '미분류',
    price: item.price ?? null,
    status: item.status ?? null,
    description: item.description ?? '',
  }))

  const activeCount = listings.filter((item) => item.status === 'active').length
  const reservedCount = listings.filter((item) => item.status === 'reserved').length
  const soldCount = listings.filter((item) => item.status === 'sold').length

  return (
    <div style={pageStyle}>
      <section style={heroCardStyle}>
        <div style={badgeStyle}>MSELL MOBILE</div>

        <h1 style={heroTitleStyle}>
          모바일에서 더 빠르게
          <br />
          자산을 확인하고
          <br />
          거래를 시작하세요
        </h1>

        <p style={heroDescStyle}>
          모바일 전용 흐름으로 디지털 자산 목록 확인, 상세 진입, 거래 문의 시작까지
          자연스럽게 이어집니다.
        </p>

        <div style={actionGridStyle}>
          <Link href="/m/listings" style={primaryButtonStyle}>
            모바일 거래목록
          </Link>
          <Link href="/listings/create" style={secondaryButtonStyle}>
            자산 등록하기
          </Link>
          <Link href="/?view=desktop" style={ghostButtonStyle}>
            웹 버전 보기
          </Link>
        </div>
      </section>

      <section style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>거래가능</span>
          <strong style={statValueStyle}>{activeCount}</strong>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>예약중</span>
          <strong style={statValueStyle}>{reservedCount}</strong>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>거래종료</span>
          <strong style={statValueStyle}>{soldCount}</strong>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadStyle}>
          <h2 style={sectionTitleStyle}>최근 자산</h2>
          <Link href="/m/listings" style={sectionLinkStyle}>
            전체보기
          </Link>
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
  fontSize: 34,
  lineHeight: 1.04,
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

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 10,
}

const statCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dccfbe',
  borderRadius: 22,
  padding: '16px 14px',
  boxShadow: '0 18px 50px rgba(47, 36, 23, 0.08)',
}

const statLabelStyle: React.CSSProperties = {
  display: 'block',
  color: '#7c6754',
  fontSize: 12,
  fontWeight: 700,
}

const statValueStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 10,
  fontSize: 24,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: '#241b11',
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

const sectionLinkStyle: React.CSSProperties = {
  color: '#2f2417',
  fontSize: 14,
  fontWeight: 800,
  textDecoration: 'none',
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