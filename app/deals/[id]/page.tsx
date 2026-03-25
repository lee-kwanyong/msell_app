import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type RawRow = Record<string, any>

type DealStatus = 'open' | 'completed' | 'cancelled'

type NormalizedDeal = {
  id: string
  listing_id: string | null
  buyer_id: string | null
  seller_id: string | null
  status: DealStatus
  created_at: string | null
  updated_at: string | null
}

type NormalizedListing = {
  id: string
  owner_id: string | null
  title: string
  description: string
  symbol: string
  trade_type: string
  currency: string
  price_text: string
  quantity_text: string
  is_closed: boolean
  status: string
}

type NormalizedMessage = {
  id: string
  deal_id: string | null
  sender_id: string | null
  body: string
  created_at: string | null
}

function pickFirst<T = any>(row: RawRow, keys: string[], fallback: T): T {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return value as T
    }
  }
  return fallback
}

function toStringSafe(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return fallback
}

function toNumberSafe(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    if (!cleaned) return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function formatNumberKR(value: number | null) {
  if (value === null) return '-'
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDateTimeKR(value: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function normalizeDeal(row: RawRow): NormalizedDeal {
  const rawStatus = toStringSafe(pickFirst(row, ['status'], 'open'), 'open').toLowerCase()

  const status: DealStatus =
    rawStatus === 'completed'
      ? 'completed'
      : rawStatus === 'cancelled'
      ? 'cancelled'
      : 'open'

  return {
    id: toStringSafe(pickFirst(row, ['id'], ''), ''),
    listing_id: pickFirst<string | null>(row, ['listing_id'], null),
    buyer_id: pickFirst<string | null>(row, ['buyer_id'], null),
    seller_id: pickFirst<string | null>(row, ['seller_id'], null),
    status,
    created_at: pickFirst<string | null>(row, ['created_at'], null),
    updated_at: pickFirst<string | null>(row, ['updated_at'], null),
  }
}

function normalizeListing(row: RawRow): NormalizedListing {
  const price =
    toNumberSafe(
      pickFirst(row, ['price', 'ask_price', 'amount_price', 'unit_price'], null),
    ) ?? null

  const quantity =
    toNumberSafe(
      pickFirst(row, ['quantity', 'amount', 'volume', 'units'], null),
    ) ?? null

  const currency = toStringSafe(
    pickFirst(row, ['currency', 'settlement_currency', 'fiat_currency'], 'KRW'),
    'KRW',
  )

  const rawStatus = toStringSafe(
    pickFirst(row, ['status', 'listing_status'], 'active'),
    'active',
  ).toLowerCase()

  const isClosed =
    Boolean(pickFirst(row, ['is_closed', 'closed', 'sold_out'], false)) ||
    rawStatus === 'closed'

  return {
    id: toStringSafe(pickFirst(row, ['id', 'listing_id', 'post_id'], ''), ''),
    owner_id: pickFirst<string | null>(
      row,
      ['user_id', 'owner_id', 'created_by', 'seller_id', 'author_id', 'writer_id'],
      null,
    ),
    title: toStringSafe(
      pickFirst(row, ['title', 'subject', 'headline', 'name'], '제목 없음'),
      '제목 없음',
    ),
    description: toStringSafe(
      pickFirst(row, ['description', 'content', 'body', 'memo'], ''),
      '',
    ),
    symbol: toStringSafe(
      pickFirst(row, ['symbol', 'ticker', 'code'], ''),
      '',
    ),
    trade_type: toStringSafe(
      pickFirst(row, ['trade_type', 'side', 'deal_type'], 'sell'),
      'sell',
    ),
    currency,
    price_text: price !== null ? `${formatNumberKR(price)} ${currency}` : '-',
    quantity_text: quantity !== null ? formatNumberKR(quantity) : '-',
    is_closed: isClosed,
    status: rawStatus || 'active',
  }
}

function normalizeMessage(row: RawRow): NormalizedMessage {
  return {
    id: toStringSafe(pickFirst(row, ['id'], ''), ''),
    deal_id: pickFirst<string | null>(row, ['deal_id'], null),
    sender_id: pickFirst<string | null>(row, ['sender_id', 'user_id', 'author_id'], null),
    body: toStringSafe(
      pickFirst(row, ['body', 'content', 'message', 'text'], ''),
      '',
    ),
    created_at: pickFirst<string | null>(row, ['created_at'], null),
  }
}

async function markNotificationsRead(supabase: Awaited<ReturnType<typeof supabaseServer>>, dealId: string, userId: string) {
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, user_id, recipient_id, deal_id, is_read')
    .eq('deal_id', dealId)
    .eq('is_read', false)

  const rows = Array.isArray(notifications) ? notifications : []

  const targetIds = rows
    .filter((row) => {
      const recipientId = pickFirst<string | null>(row, ['user_id', 'recipient_id'], null)
      return recipientId === userId
    })
    .map((row) => String(row.id))

  if (targetIds.length > 0) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', targetIds)
  }
}

export default async function DealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ error?: string; success?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const errorMessage = resolvedSearchParams?.error ?? ''
  const successMessage = resolvedSearchParams?.success ?? ''

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/deal/${id}`)
  }

  const { data: dealRow } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!dealRow) {
    notFound()
  }

  const deal = normalizeDeal(dealRow)
  const isParticipant = deal.buyer_id === user.id || deal.seller_id === user.id

  if (!isParticipant) {
    redirect('/my/deals?error=접근 권한이 없는 거래방이야')
  }

  await markNotificationsRead(supabase, deal.id, user.id)

  const { data: listingRow } = deal.listing_id
    ? await supabase.from('listings').select('*').eq('id', deal.listing_id).maybeSingle()
    : { data: null }

  const listing = listingRow ? normalizeListing(listingRow) : null

  const { data: messagesData, error: messagesError } = await supabase
    .from('deal_messages')
    .select('*')
    .eq('deal_id', deal.id)
    .order('created_at', { ascending: true })

  const messages = (Array.isArray(messagesData) ? messagesData : []).map(normalizeMessage)

  const myRole = deal.buyer_id === user.id ? 'buyer' : 'seller'
  const counterpartyId = deal.buyer_id === user.id ? deal.seller_id : deal.buyer_id

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '32px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 28,
            boxShadow: '0 10px 30px rgba(47,36,23,0.05)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 10,
                }}
              >
                <Badge
                  text={
                    deal.status === 'completed'
                      ? '거래 완료'
                      : deal.status === 'cancelled'
                      ? '거래 취소'
                      : '진행 중'
                  }
                  tone={
                    deal.status === 'completed'
                      ? 'muted'
                      : deal.status === 'cancelled'
                      ? 'draft'
                      : 'active'
                  }
                />
                <Badge text={myRole === 'buyer' ? '구매자 입장' : '판매자 입장'} tone="owner" />
              </div>

              <div style={{ fontSize: 13, color: '#7b6a55', marginBottom: 10 }}>
                DEAL ROOM
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 32,
                  lineHeight: 1.2,
                  color: '#2f2417',
                  fontWeight: 800,
                }}
              >
                {listing?.title || '거래방'}
              </h1>

              <p
                style={{
                  margin: '12px 0 0',
                  color: '#5f513f',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                메시지 전송 후 같은 거래방으로 다시 돌아오도록 맞췄다. 기존 거래가 있으면 재사용되는 구조와 이어진다.
              </p>
            </div>

            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: '#fbf8f3',
                border: '1px solid #f0e6d7',
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#7b6a55',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                거래 요약
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <InfoRow label="거래방 ID" value={deal.id} />
                <InfoRow label="내 역할" value={myRole} />
                <InfoRow label="상대방" value={counterpartyId || '-'} />
                <InfoRow label="심볼" value={listing?.symbol || '-'} />
                <InfoRow label="거래유형" value={listing?.trade_type || '-'} />
                <InfoRow label="희망가" value={listing?.price_text || '-'} />
                <InfoRow label="수량" value={listing?.quantity_text || '-'} />
                <InfoRow label="생성일" value={formatDateTimeKR(deal.created_at)} />
                <InfoRow label="최근 갱신" value={formatDateTimeKR(deal.updated_at)} />
              </div>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <section
            style={{
              background: '#fff7f7',
              border: '1px solid #f0d5d5',
              color: '#8f2e2e',
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            {decodeURIComponent(errorMessage)}
          </section>
        ) : null}

        {successMessage ? (
          <section
            style={{
              background: '#f7fbf7',
              border: '1px solid #d9e9d9',
              color: '#2f5d32',
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            {decodeURIComponent(successMessage)}
          </section>
        ) : null}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  color: '#2f2417',
                  lineHeight: 1.3,
                }}
              >
                거래 메시지
              </h2>

              <div style={{ fontSize: 13, color: '#7b6a55' }}>
                총 {messages.length}개 메시지
              </div>
            </div>

            {messagesError ? (
              <div
                style={{
                  background: '#fff7f7',
                  border: '1px solid #f0d5d5',
                  color: '#8f2e2e',
                  borderRadius: 18,
                  padding: 16,
                  lineHeight: 1.6,
                }}
              >
                메시지를 불러오는 중 오류가 발생했다.
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  background: '#fbf8f3',
                  border: '1px solid #f0e6d7',
                  borderRadius: 18,
                  padding: 18,
                  color: '#5f513f',
                  lineHeight: 1.7,
                }}
              >
                아직 메시지가 없다. 첫 메시지를 보내서 거래 조건을 조율해라.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {messages.map((message) => {
                  const mine = message.sender_id === user.id

                  return (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: mine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          width: 'min(100%, 720px)',
                          background: mine ? '#eadfcf' : '#fbf8f3',
                          border: mine
                            ? '1px solid #dfd0bb'
                            : '1px solid #f0e6d7',
                          borderRadius: 18,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: '#7b6a55',
                            marginBottom: 8,
                            fontWeight: 700,
                          }}
                        >
                          {mine ? '나' : '상대방'} · {formatDateTimeKR(message.created_at)}
                        </div>

                        <div
                          style={{
                            fontSize: 15,
                            color: '#2f2417',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {message.body || '(빈 메시지)'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <form
              action="/api/deal-messages/create"
              method="post"
              style={{ marginTop: 18 }}
            >
              <input type="hidden" name="deal_id" value={deal.id} />
              <input type="hidden" name="redirect_to" value={`/deal/${deal.id}`} />

              <div
                style={{
                  background: '#fbf8f3',
                  border: '1px solid #f0e6d7',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: '#5f513f',
                    marginBottom: 10,
                    fontWeight: 700,
                  }}
                >
                  메시지 보내기
                </div>

                <textarea
                  name="body"
                  rows={5}
                  placeholder="예: 수량 5,000 기준으로 오늘 저녁 거래 가능할까요?"
                  style={{
                    width: '100%',
                    borderRadius: 14,
                    border: '1px solid #dbcdb9',
                    background: '#fffdfa',
                    padding: 14,
                    fontSize: 15,
                    color: '#2f2417',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: 140,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 12,
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      minHeight: 44,
                      padding: '0 18px',
                      borderRadius: 14,
                      border: 'none',
                      background: '#2f2417',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    메시지 전송
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside
            style={{
              background: '#ffffff',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: 20,
              height: 'fit-content',
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: '#7b6a55',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              바로 이동
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <Link href="/my/deals" style={secondaryButtonStyle}>
                내 거래 목록
              </Link>

              {listing?.id ? (
                <Link href={`/listings/${listing.id}`} style={secondaryButtonStyle}>
                  연결 매물 보기
                </Link>
              ) : null}

              <Link href="/listings" style={primaryButtonStyle}>
                다른 매물 보기
              </Link>
            </div>

            {listing ? (
              <div
                style={{
                  marginTop: 18,
                  background: '#fbf8f3',
                  border: '1px solid #f0e6d7',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: '#2f2417',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  연결 매물 상태
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <InfoRow label="상태" value={listing.status || '-'} />
                  <InfoRow label="종료 여부" value={listing.is_closed ? 'true' : 'false'} />
                </div>
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  )
}

function Badge({
  text,
  tone,
}: {
  text: string
  tone: 'active' | 'muted' | 'draft' | 'owner'
}) {
  const styleMap: Record<string, { background: string; color: string }> = {
    active: { background: '#f3eee5', color: '#5f513f' },
    muted: { background: '#efe7da', color: '#5f513f' },
    draft: { background: '#f4eee4', color: '#5f513f' },
    owner: { background: '#eadfcf', color: '#2f2417' },
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 30,
        padding: '0 11px',
        borderRadius: 999,
        background: styleMap[tone].background,
        color: styleMap[tone].color,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '84px minmax(0, 1fr)',
        gap: 10,
        alignItems: 'start',
      }}
    >
      <div style={{ fontSize: 13, color: '#7b6a55' }}>{label}</div>
      <div
        style={{
          fontSize: 14,
          color: '#2f2417',
          fontWeight: 700,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 44,
  padding: '0 16px',
  borderRadius: 14,
  background: '#2f2417',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
}

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 44,
  padding: '0 16px',
  borderRadius: 14,
  background: '#eadfcf',
  color: '#2f2417',
  textDecoration: 'none',
  fontWeight: 700,
}