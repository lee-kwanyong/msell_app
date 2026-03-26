import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ success?: string; error?: string }>
}

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '가격 미정'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return `${numeric.toLocaleString('ko-KR')}원`
}

function decodeText(value?: string) {
  return value ? decodeURIComponent(value) : ''
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

function extractTransferMethod(description?: string | null) {
  if (!description) return ''
  const match = description.match(/^\[이전 방식\]\s*(.*)$/m)
  return match?.[1]?.trim() || ''
}

function stripTransferMethod(description?: string | null) {
  if (!description) return ''
  return description.replace(/^\[이전 방식\]\s*.*(\n\n)?/m, '').trim()
}

export default async function MobileListingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const pageParams = searchParams ? await searchParams : undefined
  const success = decodeText(pageParams?.success)
  const error = decodeText(pageParams?.error)

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (listingError || !listing) {
    notFound()
  }

  const ownerId = listing.user_id ?? ''
  const isOwner = !!user?.id && user.id === ownerId
  const status = listing.status ?? 'active'
  const statusLabel = getStatusLabel(status)
  const transferMethod = extractTransferMethod(listing.description)
  const pureDescription = stripTransferMethod(listing.description)

  let ownerProfile: any = null

  if (ownerId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', ownerId)
      .maybeSingle()

    ownerProfile = data
  }

  async function startDealAction(formData: FormData) {
    'use server'

    const listingId = String(formData.get('listing_id') ?? '')

    if (!listingId) {
      redirect(`/m/listings/${id}?error=${encodeURIComponent('잘못된 요청입니다.')}`)
    }

    redirect(
      `/api/deals/create?listing_id=${encodeURIComponent(listingId)}&return_to=/m/listings/${encodeURIComponent(listingId)}`
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '18px 14px 132px',
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
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/m/listings" style={topNavLinkStyle}>
            ← 목록
          </Link>
          <Link href="/m/my/listings" style={topNavLinkStyle}>
            내 자산
          </Link>
          {isOwner ? (
            <Link href={`/listings/${id}/edit`} style={editLinkStyle}>
              수정
            </Link>
          ) : null}
        </div>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}
        {success ? <div style={successBoxStyle}>{success}</div> : null}

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={statusBadgeStyle}>{statusLabel}</span>
            {listing.category ? (
              <span style={categoryBadgeStyle}>{listing.category}</span>
            ) : null}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.25,
              fontWeight: 900,
              color: '#241b11',
              wordBreak: 'keep-all',
            }}
          >
            {listing.title || '제목 없음'}
          </h1>

          <div
            style={{
              fontSize: 28,
              lineHeight: 1.2,
              fontWeight: 900,
              color: '#2f2417',
            }}
          >
            {formatPrice(listing.price)}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <InfoCard
              label="판매자"
              value={
                ownerProfile?.full_name ||
                ownerProfile?.username ||
                '판매자 정보 없음'
              }
            />
            <InfoCard label="자산 상태" value={statusLabel} />
            <InfoCard label="이전 방식" value={transferMethod || '별도 협의'} />
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 18,
              background: '#fbf7f0',
              border: '1px solid #efe4d5',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#241b11',
                marginBottom: 8,
              }}
            >
              설명
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                color: '#5f4f3f',
                fontSize: 14,
                lineHeight: 1.8,
                wordBreak: 'keep-all',
              }}
            >
              {pureDescription || '등록된 설명이 없습니다.'}
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: 24,
            padding: 20,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
            display: 'grid',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255,248,236,0.78)',
            }}
          >
            QUICK ACTION
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: 1.2,
              fontWeight: 900,
            }}
          >
            모바일에서 바로
            <br />
            거래를 시작하세요
          </h2>

          <div
            style={{
              display: 'grid',
              gap: 8,
            }}
          >
            <ActionInfo text={`상태: ${statusLabel}`} />
            <ActionInfo text={`가격: ${formatPrice(listing.price)}`} />
            <ActionInfo text={`이전 방식: ${transferMethod || '별도 협의'}`} />
          </div>

          {isOwner ? (
            <div style={ownerNoticeStyle}>
              본인 자산입니다. 수정 페이지에서 내용과 상태를 관리할 수 있습니다.
            </div>
          ) : status === 'sold' || status === 'hidden' || status === 'archived' ? (
            <div style={ownerNoticeStyle}>
              현재 이 자산은 바로 문의를 시작할 수 없는 상태입니다.
            </div>
          ) : user ? (
            <form action={startDealAction} style={{ display: 'grid', gap: 10 }}>
              <input type="hidden" name="listing_id" value={id} />
              <button type="submit" style={primaryCtaStyle}>
                거래 문의 시작
              </button>
              <Link href="/m/my/deals" style={secondaryCtaStyle}>
                내 거래 보기
              </Link>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <Link
                href={`/m/auth/login?next=${encodeURIComponent(`/m/listings/${id}`)}`}
                style={primaryCtaLinkStyle}
              >
                로그인 후 문의 시작
              </Link>
              <Link
                href={`/m/auth/signup?next=${encodeURIComponent(`/m/listings/${id}`)}`}
                style={secondaryCtaStyle}
              >
                회원가입
              </Link>
            </div>
          )}
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <GuideLine text="문의 시작 시 기존 deal이 있으면 재사용됩니다." />
          <GuideLine text="본인 자산에는 문의를 시작할 수 없습니다." />
          <GuideLine text="메시지는 deal room에서 이어서 확인할 수 있습니다." />
        </section>
      </div>
    </main>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 5,
        padding: '13px 14px',
        borderRadius: 16,
        background: '#fbf7f0',
        border: '1px solid #efe4d5',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#8a745b',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#241b11',
          lineHeight: 1.6,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function ActionInfo({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '11px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 13,
        fontWeight: 700,
        color: 'rgba(255,248,236,0.86)',
      }}
    >
      {text}
    </div>
  )
}

function GuideLine({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 14,
        background: '#fbf7f0',
        border: '1px solid #efe4d5',
        color: '#5f4f3f',
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      {text}
    </div>
  )
}

const topNavLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  padding: '0 13px',
  borderRadius: 14,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 13,
}

const editLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  padding: '0 13px',
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 13,
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

const primaryCtaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 18,
  border: 'none',
  background: '#fffaf4',
  color: '#241b11',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
}

const primaryCtaLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 54,
  borderRadius: 18,
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontSize: 15,
  fontWeight: 900,
}

const secondaryCtaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 48,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  color: '#fffaf2',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 800,
  background: 'transparent',
}

const ownerNoticeStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,248,236,0.9)',
  fontSize: 14,
  lineHeight: 1.75,
  fontWeight: 700,
}

const errorBoxStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 14,
  background: '#fff4f2',
  border: '1px solid #f1d0c8',
  color: '#9a3f2d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}

const successBoxStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f4fbf4',
  border: '1px solid #d5ead5',
  color: '#2f6b3d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}