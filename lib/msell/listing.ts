export type RawRow = Record<string, any>

export type ListingStatus = 'active' | 'closed' | 'hidden' | 'draft'

export type NormalizedListing = {
  id: string
  user_id: string | null
  seller_id: string | null
  author_id: string | null

  title: string
  description: string
  category: string
  asset_type: string
  symbol: string
  price_text: string
  quantity_text: string
  currency: string
  trade_type: string

  status: ListingStatus
  is_closed: boolean
  created_at: string | null
  updated_at: string | null

  source: RawRow
}

const pickFirst = <T = any>(row: RawRow, keys: string[], fallback: T): T => {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return value as T
    }
  }
  return fallback
}

const toStringSafe = (value: unknown, fallback = '') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return fallback
}

const toNumberSafe = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    if (!cleaned) return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function formatNumberKR(value: number | null) {
  if (value === null) return '-'
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function formatDateKR(value: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function normalizeListing(row: RawRow): NormalizedListing {
  const id = toStringSafe(
    pickFirst(row, ['id', 'listing_id', 'post_id'], ''),
    '',
  )

  const user_id = pickFirst<string | null>(
    row,
    ['user_id', 'owner_id', 'created_by'],
    null,
  )

  const seller_id = pickFirst<string | null>(
    row,
    ['seller_id'],
    null,
  )

  const author_id = pickFirst<string | null>(
    row,
    ['author_id', 'writer_id'],
    null,
  )

  const rawStatus = toStringSafe(
    pickFirst(row, ['status', 'listing_status'], 'active'),
    'active',
  ).toLowerCase()

  const isClosed = Boolean(
    pickFirst(row, ['is_closed', 'closed', 'sold_out'], false),
  ) || rawStatus === 'closed'

  const status: ListingStatus =
    rawStatus === 'closed'
      ? 'closed'
      : rawStatus === 'hidden'
      ? 'hidden'
      : rawStatus === 'draft'
      ? 'draft'
      : isClosed
      ? 'closed'
      : 'active'

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

  const title = toStringSafe(
    pickFirst(row, ['title', 'subject', 'headline', 'name'], '제목 없음'),
    '제목 없음',
  )

  const description = toStringSafe(
    pickFirst(row, ['description', 'content', 'body', 'memo'], ''),
    '',
  )

  const category = toStringSafe(
    pickFirst(row, ['category', 'market', 'listing_type'], 'digital_asset'),
    'digital_asset',
  )

  const asset_type = toStringSafe(
    pickFirst(row, ['asset_type', 'asset', 'product_type'], ''),
    '',
  )

  const symbol = toStringSafe(
    pickFirst(row, ['symbol', 'ticker', 'code'], ''),
    '',
  )

  const trade_type = toStringSafe(
    pickFirst(row, ['trade_type', 'side', 'deal_type'], 'sell'),
    'sell',
  )

  const price_text =
    price !== null ? `${formatNumberKR(price)} ${currency}` : '-'

  const quantity_text =
    quantity !== null ? formatNumberKR(quantity) : '-'

  return {
    id,
    user_id,
    seller_id,
    author_id,
    title,
    description,
    category,
    asset_type,
    symbol,
    price_text,
    quantity_text,
    currency,
    trade_type,
    status,
    is_closed: isClosed,
    created_at: pickFirst<string | null>(row, ['created_at', 'inserted_at'], null),
    updated_at: pickFirst<string | null>(row, ['updated_at'], null),
    source: row,
  }
}

export function getListingOwnerId(listing: NormalizedListing) {
  return listing.user_id ?? listing.seller_id ?? listing.author_id ?? null
}

export function isListingVisiblePublic(listing: NormalizedListing) {
  if (listing.status === 'hidden' || listing.status === 'draft') return false
  return true
}

export function isListingActive(listing: NormalizedListing) {
  return listing.status === 'active' && !listing.is_closed
}