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
  const cleaned = value
    .replace(/^\[이전 방식\]\s*.*(\n\n)?/m, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return '설명이 아직 없습니다.'
  return cleaned.length > 90 ? `${cleaned.slice(0, 90)}...` : cleaned
}

export default async function MobileMyListingsPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/m/auth/login?next=/m/my/listings')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = listings ?? []

  const totalCount = items.length
  const activeCount = items.filter((item) => item.status === 'active').length
  const soldCount = items.filter((item) => item.status === 'sold').length
  const hiddenCount = items.filter((item) => item.status === 'hidden').length

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '18px 14px 120px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          style={{
            borderRadius: 24,
            padding: 22,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255,248,236,0.78)',
              marginBottom: 8,
            }}
          >
            MY LISTINGS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.18,
              fontWeight: 900,
            }}
          >
            내 자산 관리
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255,248,236,0.82)',
            }}
          >
            등록한 자산 상태를 빠르게 확인하고 바로 수정할 수 있게 모바일 화면에 맞게 정리했습니다.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            <MetricCard label="전체" value={String(totalCount)} />
            <MetricCard label="거래가능" value={String(activeCount)} />
            <MetricCard label="거래종료" value={String(soldCount)} />
            <MetricCard label="숨김" value={String(hiddenCount)} />
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/m/listings/create" style={primaryTopLinkStyle}>
            + 자산 등록
          </Link>
          <Link href="/m/listings" style={secondaryTopLinkStyle}>
            거래목록 보기
          </Link>
        </section>

        <section
          style={{
            display: 'grid',
            gap: 10,
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #eadfcf',
                borderRadius: 22,
                padding: 24,
                textAlign: 'center',
                color: '#6a5743',
                fontSize: 14,
                lineHeight: 1.8,
                boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
              }}
            >
              아직 등록한 자산이 없습니다.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #eadfcf',
                  borderRadius: 22,
                  padding: 16,
                  boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={statusBadgeStyle}>{getStatusLabel(item.status)}</span>
                    {item.category ? (
                      <span style={categoryBadgeStyle}>{item.category}</span>
                    ) : null}
                  </div>

                  <Link href={`/m/listings/${item.id}`} style={smallLinkStyle}>
                    상세
                  </Link>
                </div>

                <div
                  style={{
                    fontSize: 17,
                    lineHeight: 1.45,
                    fontWeight: 900,
                    color: '#241b11',
                    wordBreak: 'keep-all',
                  }}
                >
                  {item.title || '제목 없음'}
                </div>

                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 900,
                    color: '#2f2417',
                  }}
                >
                  {formatPrice(item.price)}
                </div>

                <div
                  style={{
                    color: '#6a5743',
                    fontSize: 13,
                    lineHeight: 1.7,
                    wordBreak: 'keep-all',
                  }}
                >
                  {getShortDescription(item.description)}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                  }}
                >
                  <Link href={`/m/listings/${item.id}`} style={cardActionSecondaryStyle}>
                    상세 보기
                  </Link>
                  <Link href={`/listings/${item.id}/edit`} style={cardActionPrimaryStyle}>
                    수정하기
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '14px 14px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'rgba(255,248,236,0.74)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#fffaf2',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

const primaryTopLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const secondaryTopLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 14,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const statusBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 11,
  fontWeight: 800,
}

const categoryBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: '#f0e5d7',
  color: '#5b4938',
  fontSize: 11,
  fontWeight: 800,
}

const smallLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 32,
  padding: '0 10px',
  borderRadius: 10,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 12,
}

const cardActionPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const cardActionSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  borderRadius: 14,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}