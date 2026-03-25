import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

type ListingRow = {
  id: string
  title: string | null
  category: string | null
  price: number | string | null
  description: string | null
  status: string | null
  created_at?: string | null
  transfer_method?: string | null
}

function formatPrice(value: unknown) {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number(value)
      : NaN

  if (!Number.isFinite(num)) return '가격 협의'
  return `${num.toLocaleString('ko-KR')}원`
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR')
}

function cleanDescription(description: string | null | undefined) {
  if (!description) return ''
  return description.replace(/^\[이전 방식\].*$/m, '').trim()
}

function extractTransferMethod(
  transferMethod: string | null | undefined,
  description: string | null | undefined
) {
  if (transferMethod && transferMethod.trim()) return transferMethod.trim()
  if (!description) return null

  const match = description.match(/^\[이전 방식\]\s*(.+)$/m)
  return match?.[1]?.trim() || null
}

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case 'active':
      return '거래가능'
    case 'hidden':
      return '숨김'
    case 'draft':
      return '임시저장'
    case 'closed':
      return '거래종료'
    default:
      return '상태미정'
  }
}

export default async function BoardPage() {
  const supabase = await supabaseServer()

  const { data: listingsRaw } = await supabase
    .from('listings')
    .select('*')
    .neq('status', 'hidden')
    .order('created_at', { ascending: false })

  const listings = ((listingsRaw as ListingRow[] | null) ?? []).filter(Boolean)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '32px 20px 48px',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <section
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 24,
            boxShadow: '0 10px 30px rgba(47,36,23,0.08)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
            gap: 20,
          }}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                color: '#8a775f',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              BOARD
            </div>

            <h1
              style={{
                margin: 0,
                color: '#2f2417',
                fontSize: 42,
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              게시판
            </h1>

            <p
              style={{
                margin: 0,
                color: '#6b5a47',
                fontSize: 16,
                lineHeight: 1.75,
              }}
            >
              등록된 매물을 게시판 형식으로 한 번에 보고 상세 페이지로 이동합니다.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/listings/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  background: '#2f2417',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                글 등록
              </Link>

              <Link
                href="/my/listings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  background: '#eadfcf',
                  color: '#2f2417',
                  fontWeight: 800,
                }}
              >
                내 글 관리
              </Link>
            </div>
          </div>

          <div
            style={{
              background: '#fbf8f2',
              borderRadius: 24,
              padding: 20,
              border: '1px solid #eadfcf',
              display: 'grid',
              gap: 8,
            }}
          >
            {[
              ['전체 게시글', String(listings.length)],
              ['거래가능', String(listings.filter((v) => v.status === 'active').length)],
              ['거래종료', String(listings.filter((v) => v.status === 'closed').length)],
              ['임시저장 제외 공개글', String(listings.filter((v) => v.status !== 'draft').length)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #e8dcc9',
                }}
              >
                <span
                  style={{
                    color: '#6f5f4b',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                <strong
                  style={{
                    color: '#2f2417',
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          {listings.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 10px 30px rgba(47,36,23,0.08)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#2f2417',
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                아직 게시글이 없습니다
              </h2>
            </div>
          ) : (
            listings.map((listing) => {
              const transferMethod = extractTransferMethod(
                listing.transfer_method,
                listing.description
              )
              const description = cleanDescription(listing.description)

              return (
                <article
                  key={listing.id}
                  style={{
                    background: '#fff',
                    borderRadius: 24,
                    padding: 22,
                    boxShadow: '0 10px 30px rgba(47,36,23,0.08)',
                    display: 'grid',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 32,
                        padding: '0 12px',
                        borderRadius: 999,
                        background: '#f7f1e7',
                        color: '#6a5947',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {listing.category || '미분류'}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 32,
                        padding: '0 12px',
                        borderRadius: 999,
                        background: '#efe4d4',
                        color: '#2f2417',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {statusLabel(listing.status)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <h2
                      style={{
                        margin: 0,
                        color: '#2f2417',
                        fontSize: 30,
                        lineHeight: 1.3,
                        fontWeight: 800,
                        wordBreak: 'break-word',
                      }}
                    >
                      {listing.title || '제목 없음'}
                    </h2>

                    <div
                      style={{
                        color: '#2f2417',
                        fontSize: 24,
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(listing.price)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: '#fbf8f2',
                        borderRadius: 18,
                        padding: 16,
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      <div style={{ color: '#7a6a57', fontSize: 12, fontWeight: 700 }}>
                        이전 방식
                      </div>
                      <div style={{ color: '#2f2417', fontSize: 15, fontWeight: 800 }}>
                        {transferMethod || '미입력'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#fbf8f2',
                        borderRadius: 18,
                        padding: 16,
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      <div style={{ color: '#7a6a57', fontSize: 12, fontWeight: 700 }}>
                        작성일
                      </div>
                      <div style={{ color: '#2f2417', fontSize: 15, fontWeight: 800 }}>
                        {formatDateTime(listing.created_at)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fbf8f2',
                      borderRadius: 18,
                      padding: 16,
                      color: '#4d3d2c',
                      fontSize: 14,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {description || '설명이 없습니다.'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Link
                      href={`/listings/${listing.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 48,
                        padding: '0 18px',
                        borderRadius: 14,
                        textDecoration: 'none',
                        background: '#2f2417',
                        color: '#fff',
                        fontWeight: 800,
                      }}
                    >
                      상세 보기
                    </Link>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}