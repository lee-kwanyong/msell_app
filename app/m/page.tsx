import Link from 'next/link'
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
  return cleaned.length > 60 ? `${cleaned.slice(0, 60)}...` : cleaned
}

export default async function MobileHomePage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .in('status', ['active', 'reserved', 'sold'])
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: myDeals } = user
    ? await supabase
        .from('deals')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    : { data: [] as any[] }

  const { data: notifications } = user
    ? await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false)
    : { data: [] as any[] }

  const items = listings ?? []
  const unreadCount = (notifications ?? []).length
  const dealCount = (myDeals ?? []).length
  const activeCount = items.filter((item) => item.status === 'active').length

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
            MSELL MOBILE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.16,
              fontWeight: 900,
            }}
          >
            모바일에서 바로
            <br />
            거래를 시작하세요
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255,248,236,0.82)',
            }}
          >
            목록 확인, 자산 등록, 거래방 이동까지 한 손 동선에 맞춰 바로 들어갈 수 있게 정리했습니다.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            <HeroMetric label="거래가능" value={String(activeCount)} />
            <HeroMetric label="내 거래방" value={String(dealCount)} />
            <HeroMetric label="읽지 않은 알림" value={String(unreadCount)} />
            <HeroMetric label="최근 자산" value={String(items.length)} />
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            <Link href="/m/listings" style={heroPrimaryLinkStyle}>
              거래목록
            </Link>
            <Link href="/m/listings/create" style={heroSecondaryLinkStyle}>
              자산등록
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          <QuickMenu href="/m/my/deals" title="내 거래방" desc="대화와 진행 상태 확인" />
          <QuickMenu href="/m/my/listings" title="내 자산" desc="등록 자산 관리" />
          <QuickMenu href="/m/account" title="마이페이지" desc="계정 정보와 설정" />
          <QuickMenu href="/m/listings" title="전체 거래" desc="자산 탐색 시작" />
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 22,
            padding: 16,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#241b11',
              }}
            >
              최신 자산
            </div>

            <Link href="/m/listings" style={smallMoreLinkStyle}>
              전체 보기
            </Link>
          </div>

          {items.length === 0 ? (
            <div
              style={{
                padding: '18px 12px',
                borderRadius: 16,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
                textAlign: 'center',
                color: '#6a5743',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              아직 등록된 자산이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/m/listings/${item.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <article
                    style={{
                      background: '#fbf7f0',
                      border: '1px solid #efe4d5',
                      borderRadius: 18,
                      padding: 14,
                      display: 'grid',
                      gap: 10,
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

                    <div
                      style={{
                        fontSize: 16,
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
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
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

function QuickMenu({
  href,
  title,
  desc,
}: {
  href: string
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      style={{
        background: '#ffffff',
        border: '1px solid #eadfcf',
        borderRadius: 20,
        padding: 16,
        boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
        textDecoration: 'none',
        display: 'grid',
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: '#241b11',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: '#6a5743',
        }}
      >
        {desc}
      </div>
    </Link>
  )
}

const heroPrimaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  borderRadius: 16,
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 900,
  fontSize: 14,
}

const heroSecondaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  borderRadius: 16,
  background: '#eadfcf',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
}

const smallMoreLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 34,
  padding: '0 10px',
  borderRadius: 10,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 12,
}

const statusBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 28,
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
  minHeight: 28,
  padding: '0 10px',
  borderRadius: 999,
  background: '#f0e5d7',
  color: '#5b4938',
  fontSize: 11,
  fontWeight: 800,
}