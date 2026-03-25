import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  role?: string | null
}

type ListingRow = {
  id: string
  title?: string | null
  category?: string | null
  price?: number | null
  status?: string | null
  created_at?: string | null
  user_id?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatPrice(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '협의'
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`
}

function mapCategory(value?: string | null) {
  if (!value) return '기타'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function mapStatus(value?: string | null) {
  switch (value) {
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
      return '검토중'
    case 'rejected':
      return '반려'
    case 'archived':
      return '보관'
    default:
      return '상태확인'
  }
}

function getStatusTone(status?: string | null) {
  switch (status) {
    case 'active':
      return {
        background: '#eef8ef',
        color: '#2f6b39',
        border: '1px solid #d9ebdc',
      }
    case 'reserved':
      return {
        background: '#fff7e8',
        color: '#8a5a12',
        border: '1px solid #f0dfbc',
      }
    case 'sold':
      return {
        background: '#f3eadc',
        color: '#5f4b36',
        border: '1px solid #e5d5be',
      }
    case 'pending_review':
      return {
        background: '#eef4fb',
        color: '#31577f',
        border: '1px solid #d7e5f4',
      }
    case 'rejected':
      return {
        background: '#fff1f1',
        color: '#a03d3d',
        border: '1px solid #efcfcf',
      }
    default:
      return {
        background: '#f4f1ec',
        color: '#6f604f',
        border: '1px solid #e5ddd0',
      }
  }
}

export default async function AdminListingsPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin/listings')
  }

  const [{ data: profile }, { data: rpcIsAdmin }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_admin'),
  ])

  const me = (profile as ProfileRow | null) ?? null
  const isAdmin = rpcIsAdmin === true || me?.role === 'admin'

  if (!isAdmin) {
    redirect('/')
  }

  const { data, count } = await supabase
    .from('listings')
    .select('id,title,category,price,status,created_at,user_id', { count: 'exact' })
    .order('created_at', { ascending: false })

  const rows = ((data as ListingRow[] | null) ?? []).map((row) => ({
    id: String(row.id),
    title: row.title ?? '제목 없음',
    category: mapCategory(row.category),
    price: formatPrice(row.price),
    rawStatus: row.status ?? '',
    status: mapStatus(row.status),
    createdAt: formatDate(row.created_at),
    userId: row.user_id ? String(row.user_id) : '-',
  }))

  const activeCount = rows.filter((row) => row.rawStatus === 'active').length
  const hiddenCount = rows.filter(
    (row) => row.rawStatus === 'hidden' || row.rawStatus === 'draft'
  ).length
  const pendingCount = rows.filter((row) => row.rawStatus === 'pending_review').length

  return (
    <main className="msell-page">
      <div className="msell-shell">
        <section
          className="msell-card"
          style={{
            padding: '26px 28px 24px',
            background:
              'radial-gradient(circle at top right, rgba(234, 223, 207, 0.45), transparent 28%), linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 860 }}>
              <span className="msell-eyebrow">ADMIN LISTINGS</span>

              <h1
                style={{
                  margin: '16px 0 0',
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.05em',
                  fontWeight: 900,
                }}
              >
                전체 매물을 운영 시점에서
                <br />
                빠르게 점검하세요.
              </h1>

              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: 15,
                  lineHeight: 1.85,
                  color: '#6f604f',
                  maxWidth: 760,
                }}
              >
                일반 사용자 화면과 달리 등록자 식별 정보와 상태 흐름을 함께 확인할 수 있게
                정리했습니다. 상태 이상 매물이나 검토가 필요한 항목을 빠르게 찾는 데 초점을
                맞췄습니다.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Link href="/admin" className="msell-btn msell-btn-secondary">
                관리자 홈
              </Link>

              <Link href="/listings" className="msell-btn msell-btn-secondary">
                사용자 목록 화면
              </Link>
            </div>
          </div>
        </section>

        <section className="msell-section">
          <div className="msell-grid-3">
            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">TOTAL</div>
              <div className="msell-kpi-value">{count ?? 0}</div>
              <div className="msell-kpi-help">전체 매물 수입니다.</div>
            </div>

            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">ACTIVE / HIDDEN</div>
              <div className="msell-kpi-value">
                {activeCount} / {hiddenCount}
              </div>
              <div className="msell-kpi-help">활성 매물과 비노출 매물 현황입니다.</div>
            </div>

            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">PENDING REVIEW</div>
              <div className="msell-kpi-value">{pendingCount}</div>
              <div className="msell-kpi-help">검토가 필요한 매물 수입니다.</div>
            </div>
          </div>
        </section>

        <section className="msell-section">
          <section className="msell-card msell-panel">
            <div className="msell-panel-head">
              <div>
                <h2 className="msell-panel-title">매물 운영 목록</h2>
                <p className="msell-panel-desc">
                  제목을 누르면 상세 페이지로 이동합니다.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '130px minmax(0, 1fr) 140px 110px 240px',
                gap: 16,
                padding: '0 4px 12px',
                color: '#8e7d6a',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              <div>Category</div>
              <div>Title</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Status</div>
              <div style={{ textAlign: 'right' }}>Owner / Date</div>
            </div>

            <div className="msell-list">
              {rows.length === 0 ? (
                <div className="msell-empty">등록된 매물이 없습니다.</div>
              ) : (
                rows.map((listing) => {
                  const tone = getStatusTone(listing.rawStatus)

                  return (
                    <div
                      key={listing.id}
                      className="msell-row"
                      style={{
                        gridTemplateColumns:
                          '130px minmax(0, 1fr) 140px 110px 240px',
                      }}
                    >
                      <div className="msell-row-meta">
                        {listing.category}
                        <div className="msell-row-sub">{listing.createdAt}</div>
                      </div>

                      <div>
                        <Link href={`/listings/${listing.id}`} className="msell-row-title">
                          {listing.title}
                        </Link>
                        <div className="msell-row-sub">
                          관리자 기준으로 상태 및 등록자 흐름 확인
                        </div>
                      </div>

                      <div className="msell-row-price">{listing.price}</div>

                      <div
                        className="msell-row-status"
                        style={{
                          background: tone.background,
                          color: tone.color,
                          border: tone.border,
                        }}
                      >
                        {listing.status}
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          color: '#6f604f',
                          fontSize: 13,
                          lineHeight: 1.7,
                          wordBreak: 'break-word',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{listing.userId}</div>
                        <div>{listing.createdAt}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </section>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .msell-page div[style*='grid-template-columns: 130px minmax(0, 1fr) 140px 110px 240px'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}