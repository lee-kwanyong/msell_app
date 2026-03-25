import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type ProfileRow = {
  role?: string | null
}

type ListingRow = {
  id: string
  status?: string | null
}

type UserRow = {
  id: string
  is_banned?: boolean | null
  role?: string | null
}

type InquiryRow = {
  id: string
  status?: string | null
}

function mapRole(value?: string | null) {
  switch (value) {
    case 'admin':
      return '관리자'
    case 'operator':
      return '운영자'
    case 'member':
      return '일반회원'
    default:
      return '사용자'
  }
}

export default async function AdminPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin')
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

  const [
    { count: listingsCount, data: listingsData },
    { count: noticesCount },
    { count: usersCount, data: usersData },
    { count: adInquiryCount, data: adInquiryData },
  ] = await Promise.all([
    supabase.from('listings').select('id,status', { count: 'exact' }),
    supabase.from('posts').select('id', { count: 'exact' }).eq('source', 'notice'),
    supabase.from('profiles').select('id,role,is_banned', { count: 'exact' }),
    supabase.from('ad_inquiries').select('id,status', { count: 'exact' }),
  ])

  const listings = (listingsData as ListingRow[] | null) ?? []
  const users = (usersData as UserRow[] | null) ?? []
  const inquiries = (adInquiryData as InquiryRow[] | null) ?? []

  const activeListings = listings.filter((item) => item.status === 'active').length
  const reservedListings = listings.filter((item) => item.status === 'reserved').length
  const soldListings = listings.filter((item) => item.status === 'sold').length
  const hiddenListings = listings.filter(
    (item) =>
      item.status === 'hidden' ||
      item.status === 'draft' ||
      item.status === 'pending_review' ||
      item.status === 'archived'
  ).length

  const bannedUsers = users.filter((item) => item.is_banned === true).length
  const adminUsers = users.filter((item) => item.role === 'admin').length

  const newInquiries = inquiries.filter((item) => item.status === 'new').length
  const reviewingInquiries = inquiries.filter((item) => item.status === 'reviewing').length
  const doneInquiries = inquiries.filter((item) => item.status === 'done').length

  return (
    <main className="msell-page">
      <div className="msell-shell">
        <section
          className="msell-card"
          style={{
            padding: '26px 28px 24px',
            background:
              'radial-gradient(circle at top right, rgba(224, 202, 176, 0.42), transparent 28%), linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)',
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
              <span className="msell-eyebrow">ADMIN CONTROL CENTER</span>

              <h1
                style={{
                  margin: '16px 0 0',
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.05em',
                  fontWeight: 900,
                }}
              >
                운영 현황을 빠르게 확인하고
                <br />
                핵심 관리 화면으로 이동하세요.
              </h1>

              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: 15,
                  lineHeight: 1.85,
                  color: '#645442',
                  maxWidth: 760,
                }}
              >
                공지, 매물, 사용자, 광고문의 흐름을 한 화면에서 요약하고 필요한 관리
                페이지로 바로 연결할 수 있게 정리했습니다.
              </p>
            </div>

            <div className="msell-card-soft" style={{ padding: '16px 16px 14px', minWidth: 220 }}>
              <div className="msell-kpi-label">현재 권한</div>
              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em' }}>
                {mapRole(me?.role)}
              </div>
            </div>
          </div>

          <div
            className="admin-top-summary-grid"
            style={{
              marginTop: 20,
              borderRadius: 22,
              padding: '16px 18px',
              background: 'linear-gradient(180deg, #3a291a 0%, #20160e 100%)',
              color: '#ffffff',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 14,
              boxShadow: '0 18px 34px rgba(34, 23, 13, 0.16)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>
                LISTINGS
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{listingsCount ?? 0}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>
                NOTICE POSTS
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{noticesCount ?? 0}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>
                USERS
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{usersCount ?? 0}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>
                AD INQUIRIES
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{adInquiryCount ?? 0}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>
                ADMIN / BANNED
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>
                {adminUsers} / {bannedUsers}
              </div>
            </div>
          </div>
        </section>

        <section className="msell-section">
          <div className="msell-grid-4 admin-kpi-grid">
            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">ACTIVE / RESERVED</div>
              <div className="msell-kpi-value">
                {activeListings} / {reservedListings}
              </div>
              <div className="msell-kpi-help">거래가능 및 예약중 매물 현황입니다.</div>
            </div>

            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">SOLD / HIDDEN</div>
              <div className="msell-kpi-value">
                {soldListings} / {hiddenListings}
              </div>
              <div className="msell-kpi-help">종료 및 비노출 매물 현황입니다.</div>
            </div>

            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">NEW / REVIEWING</div>
              <div className="msell-kpi-value">
                {newInquiries} / {reviewingInquiries}
              </div>
              <div className="msell-kpi-help">신규 및 검토중 광고문의 현황입니다.</div>
            </div>

            <div className="msell-card msell-kpi">
              <div className="msell-kpi-label">DONE / TOTAL</div>
              <div className="msell-kpi-value">
                {doneInquiries} / {adInquiryCount ?? 0}
              </div>
              <div className="msell-kpi-help">처리완료 및 전체 광고문의 수입니다.</div>
            </div>
          </div>
        </section>

        <section className="msell-section">
          <div className="msell-grid-2">
            <section className="msell-card msell-panel">
              <div className="msell-panel-head">
                <div>
                  <h2 className="msell-panel-title">운영 바로가기</h2>
                  <p className="msell-panel-desc">
                    가장 자주 쓰는 관리자 기능으로 빠르게 이동할 수 있습니다.
                  </p>
                </div>
              </div>

              <div
                className="admin-quick-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                <Link href="/admin/listings" className="msell-btn msell-btn-primary" style={{ width: '100%' }}>
                  매물 관리
                </Link>

                <Link
                  href="/admin/ad-inquiries"
                  className="msell-btn msell-btn-primary"
                  style={{ width: '100%' }}
                >
                  광고문의 관리
                </Link>

                <Link href="/board/create" className="msell-btn msell-btn-secondary" style={{ width: '100%' }}>
                  공지 등록
                </Link>

                <Link href="/board" className="msell-btn msell-btn-secondary" style={{ width: '100%' }}>
                  공지사항 보기
                </Link>

                <Link href="/listings" className="msell-btn msell-btn-secondary" style={{ width: '100%' }}>
                  전체 매물 보기
                </Link>

                <Link href="/advertise/inquiry" className="msell-btn msell-btn-secondary" style={{ width: '100%' }}>
                  문의 작성 페이지
                </Link>
              </div>
            </section>

            <section className="msell-card msell-panel">
              <div className="msell-panel-head">
                <div>
                  <h2 className="msell-panel-title">운영 메모</h2>
                  <p className="msell-panel-desc">
                    관리자 화면에서 우선적으로 확인해야 하는 기준입니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div className="msell-card-soft" style={{ padding: '16px 16px 14px' }}>
                  <div className="msell-kpi-label">1</div>
                  <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, lineHeight: 1.6 }}>
                    광고문의는 신규 접수 후 빠르게 검토중 상태로 전환하세요.
                  </div>
                </div>

                <div className="msell-card-soft" style={{ padding: '16px 16px 14px' }}>
                  <div className="msell-kpi-label">2</div>
                  <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, lineHeight: 1.6 }}>
                    숨김·검수대기·종료 상태 매물의 비율을 주기적으로 확인하세요.
                  </div>
                </div>

                <div className="msell-card-soft" style={{ padding: '16px 16px 14px' }}>
                  <div className="msell-kpi-label">3</div>
                  <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, lineHeight: 1.6 }}>
                    문의 처리 후 관리자 메모와 상태값을 반드시 남겨 운영 이력을 유지하세요.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .admin-top-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .admin-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 920px) {
          .admin-quick-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .admin-top-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .admin-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}