import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type NotificationRow = {
  id: string
  user_id?: string | null
  deal_id?: string | null
  message_id?: string | null
  type?: string | null
  title?: string | null
  body?: string | null
  is_read?: boolean | null
  created_at?: string | null
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function mapNotificationType(value?: string | null) {
  switch (value) {
    case 'deal_created':
      return '거래 생성'
    case 'message_created':
      return '새 메시지'
    case 'deal_updated':
      return '거래 업데이트'
    case 'system':
      return '시스템'
    default:
      return '알림'
  }
}

function getTypeTone(type?: string | null) {
  switch (type) {
    case 'message_created':
      return {
        background: '#eef8ef',
        color: '#2f6b39',
        border: '1px solid #d9ebdc',
      }
    case 'deal_created':
      return {
        background: '#eef4fb',
        color: '#31577f',
        border: '1px solid #d7e5f4',
      }
    case 'deal_updated':
      return {
        background: '#fff7e8',
        color: '#8a5a12',
        border: '1px solid #f0dfbc',
      }
    case 'system':
      return {
        background: '#f1e3d2',
        color: '#5b4330',
        border: '1px solid #dcc1a2',
      }
    default:
      return {
        background: '#f1e3d2',
        color: '#5b4330',
        border: '1px solid #dcc1a2',
      }
  }
}

export default async function NotificationsPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/notifications')
  }

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = ((data as NotificationRow[] | null) ?? []).map((row) => ({
    id: String(row.id),
    dealId: row.deal_id ? String(row.deal_id) : '',
    type: row.type ?? '',
    typeLabel: mapNotificationType(row.type),
    title: row.title?.trim() || '알림',
    body: row.body?.trim() || '',
    isRead: row.is_read === true,
    createdAt: formatDateTime(row.created_at),
  }))

  const totalCount = rows.length
  const unreadCount = rows.filter((row) => !row.isRead).length
  const readCount = rows.filter((row) => row.isRead).length
  const messageCount = rows.filter((row) => row.type === 'message_created').length

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
              <span className="msell-eyebrow">NOTIFICATIONS CENTER</span>

              <h1
                style={{
                  margin: '16px 0 0',
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.05em',
                  fontWeight: 900,
                }}
              >
                중요한 거래 흐름을
                <br />
                알림으로 빠르게 확인하세요.
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
                새 메시지, 거래 생성, 상태 변화 같은 핵심 이벤트를 한 곳에서 모아봅니다.
                필요한 경우 바로 거래방으로 이동해 흐름을 이어갈 수 있게 정리했습니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/my/deals" className="msell-btn msell-btn-primary">
                내 거래 보기
              </Link>
              <Link href="/board" className="msell-btn msell-btn-secondary">
                운영 공지
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              borderRadius: 22,
              padding: '16px 18px',
              background: 'linear-gradient(180deg, #3a291a 0%, #20160e 100%)',
              color: '#ffffff',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 14,
              boxShadow: '0 18px 34px rgba(34, 23, 13, 0.16)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>TOTAL</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{totalCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>UNREAD</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{unreadCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>READ</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{readCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.72 }}>MESSAGE ALERTS</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>{messageCount}</div>
            </div>
          </div>
        </section>

        <section className="msell-section">
          <section className="msell-card msell-panel">
            <div className="msell-panel-head">
              <div>
                <h2 className="msell-panel-title">알림 목록</h2>
                <p className="msell-panel-desc">
                  거래방으로 연결되는 알림을 우선적으로 확인하세요.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {rows.length === 0 ? (
                <div className="msell-empty">
                  아직 도착한 알림이 없습니다.
                  <br />
                  거래가 시작되거나 새 메시지가 오면 이곳에 표시됩니다.
                </div>
              ) : (
                rows.map((notification) => {
                  const tone = getTypeTone(notification.type)
                  const href = notification.dealId ? `/deal/${notification.dealId}` : '/notifications'

                  return (
                    <Link
                      key={notification.id}
                      href={href}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '150px minmax(0, 1fr) 120px',
                        gap: 16,
                        alignItems: 'center',
                        padding: '18px 18px',
                        borderRadius: 22,
                        border: notification.isRead ? '1px solid #e7d8c4' : '1px solid #ccb79c',
                        background: notification.isRead ? '#fffdf9' : '#ffffff',
                        textDecoration: 'none',
                        boxShadow: notification.isRead
                          ? '0 8px 18px rgba(34, 23, 13, 0.04)'
                          : '0 14px 28px rgba(34, 23, 13, 0.07)',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 32,
                            padding: '0 12px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            background: tone.background,
                            color: tone.color,
                            border: tone.border,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notification.typeLabel}
                        </span>

                        {!notification.isRead ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 28,
                              padding: '0 10px',
                              borderRadius: 999,
                              background: 'linear-gradient(180deg, #3a291a 0%, #20160e 100%)',
                              color: '#ffffff',
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            NEW
                          </span>
                        ) : null}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: '#2c1f14',
                            fontSize: 18,
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {notification.title}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            color: '#645442',
                            fontSize: 14,
                            lineHeight: 1.75,
                            wordBreak: 'break-word',
                          }}
                        >
                          {notification.body || '상세 내용을 확인하려면 알림을 열어보세요.'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', justifyItems: 'end', gap: 8 }}>
                        <div
                          style={{
                            color: '#8a7762',
                            fontSize: 13,
                            fontWeight: 700,
                            textAlign: 'right',
                            lineHeight: 1.5,
                          }}
                        >
                          {notification.createdAt}
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 34,
                            padding: '0 12px',
                            borderRadius: 999,
                            background: '#f1e3d2',
                            color: '#5b4330',
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          이동
                        </span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </section>
        </section>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .msell-page div[style*='grid-template-columns: repeat(4, minmax(0, 1fr))'] {
            grid-template-columns: 1fr 1fr !important;
          }

          .msell-page a[style*='grid-template-columns: 150px minmax(0, 1fr) 120px'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}