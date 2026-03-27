import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const STATUS_OPTIONS = [
  { value: 'active', label: '거래가능' },
  { value: 'hidden', label: '숨김' },
  { value: 'draft', label: '임시저장' },
  { value: 'sold', label: '거래종료' },
]

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await supabaseServer()

  const [
    {
      data: { user },
    },
    resolvedSearchParams,
  ] = await Promise.all([supabase.auth.getUser(), searchParams])

  if (!user) {
    redirect('/auth/login?next=/listings/create')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')
    .order('name', { ascending: true })

  const error = getString(resolvedSearchParams?.error)
  const title = getString(resolvedSearchParams?.title) ?? ''
  const category = getString(resolvedSearchParams?.category) ?? ''
  const price = getString(resolvedSearchParams?.price) ?? ''
  const transferMethod = getString(resolvedSearchParams?.transfer_method) ?? ''
  const description = getString(resolvedSearchParams?.description) ?? ''
  const status = getString(resolvedSearchParams?.status) ?? 'active'

  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: 'calc(100vh - 72px)',
        padding: '44px 20px 84px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <section
          style={{
            border: '1px solid #e5d9ca',
            background: '#fcfaf6',
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
          }}
        >
          <div
            style={{
              padding: '30px 32px 24px',
              borderBottom: '1px solid #ece0d2',
              background: 'linear-gradient(180deg, #fcfaf6 0%, #f7f1e8 100%)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '7px 12px',
                borderRadius: 999,
                background: '#efe3d2',
                color: '#7b6140',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              LISTING CREATE
            </div>

            <h1
              style={{
                margin: '16px 0 10px',
                fontSize: 40,
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: '#1f1710',
              }}
            >
              자산 등록
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 700,
                color: '#6f655b',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              핵심 필드만 간결하게 입력하는 구조로 정리했습니다. 등록 실패가 나지 않도록
              폼과 저장 로직을 동일한 기준으로 맞춘 버전입니다.
            </p>
          </div>

          <div style={{ padding: 28 }}>
            {error ? (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: 16,
                  border: '1px solid #efcdc8',
                  background: '#fff4f2',
                  color: '#8a2f25',
                  padding: '13px 15px',
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            ) : null}

            <form action="/api/listings/create" method="post">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 16,
                }}
                className="listing-create-grid"
              >
                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    htmlFor="title"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    제목
                  </label>
                  <input
                    id="title"
                    name="title"
                    defaultValue={title}
                    placeholder="예: 인스타그램 계정 매도"
                    required
                    style={{
                      width: '100%',
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '0 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    카테고리
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={category}
                    required
                    style={{
                      width: '100%',
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '0 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    {(categories ?? []).map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    희망 가격
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    defaultValue={price}
                    placeholder="예: 300000"
                    required
                    style={{
                      width: '100%',
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '0 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    htmlFor="transfer_method"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    이전 방식
                  </label>
                  <input
                    id="transfer_method"
                    name="transfer_method"
                    defaultValue={transferMethod}
                    placeholder="예: 이메일 변경, 관리자 권한 이전, 계정 전체 양도"
                    required
                    style={{
                      width: '100%',
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '0 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    htmlFor="description"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    설명
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={description}
                    placeholder="거래 대상의 상태, 인수인계 범위, 참고사항 등을 입력하세요."
                    rows={8}
                    required
                    style={{
                      width: '100%',
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '14px 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.7,
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    htmlFor="status"
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 13,
                      color: '#3f3121',
                      fontWeight: 800,
                    }}
                  >
                    상태
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={status}
                    style={{
                      width: '100%',
                      height: 54,
                      borderRadius: 15,
                      border: '1px solid #dfd1bf',
                      background: '#fffdfa',
                      padding: '0 15px',
                      color: '#221a12',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  border: '1px solid #eee2d3',
                  background: '#faf5ee',
                  borderRadius: 18,
                  padding: '17px 18px',
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: '#6f6254',
                }}
              >
                등록 시 제목, 카테고리, 가격, 설명이 저장되며 이전 방식은 설명 상단에 함께
                정리됩니다. 값이 비어 있거나 형식이 맞지 않으면 등록되지 않도록 안전하게
                막아둔 상태입니다.
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 20,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/listings"
                  style={{
                    height: 46,
                    padding: '0 16px',
                    borderRadius: 14,
                    border: '1px solid #e0d4c4',
                    background: '#f7efe4',
                    color: '#2f2417',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  목록으로
                </Link>

                <button
                  type="submit"
                  style={{
                    height: 48,
                    minWidth: 120,
                    padding: '0 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
                    color: '#fffaf3',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 10px 24px rgba(47,36,23,0.18)',
                  }}
                >
                  자산 등록하기
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .listing-create-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}