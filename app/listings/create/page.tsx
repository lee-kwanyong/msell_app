import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import CategoryDropdown from '@/components/listings/CategoryDropdown'

type PageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

function getErrorMessage(error?: string) {
  switch (error) {
    case 'missing_required_fields':
      return '필수 항목을 모두 입력해주세요.'
    case 'unauthorized':
      return '로그인 후 등록할 수 있습니다.'
    case 'create_failed':
      return '자산 등록 중 문제가 발생했습니다.'
    default:
      return ''
  }
}

export default async function CreateListingPage({ searchParams }: PageProps) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/listings/create')
  }

  const resolvedSearchParams = (await searchParams) || {}
  const errorMessage = getErrorMessage(resolvedSearchParams.error)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '28px 20px 80px',
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/listings"
            style={{
              textDecoration: 'none',
              color: '#6f5b46',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ← 자산목록
          </Link>

          <span
            style={{
              color: '#b7aa9a',
              fontSize: 13,
            }}
          >
            /
          </span>

          <span
            style={{
              color: '#8a7762',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            자산 등록
          </span>
        </div>

        <section
          style={{
            marginBottom: 18,
            borderRadius: 24,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(246,241,231,0.92) 100%)',
            border: '1px solid rgba(47,36,23,0.08)',
            boxShadow: '0 16px 42px rgba(47,36,23,0.06)',
            padding: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#9a6b2f',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              CREATE LISTING
            </div>

            <h1
              style={{
                margin: 0,
                color: '#2f2417',
                fontSize: 32,
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}
            >
              새 자산 등록
            </h1>

            <p
              style={{
                margin: '10px 0 0',
                color: '#6f5d49',
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              거래 가능한 디지털 자산 정보를 입력하고 바로 마켓에 올릴 수 있습니다.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 42,
              padding: '0 14px',
              borderRadius: 999,
              background: '#fbf8f2',
              border: '1px solid rgba(47,36,23,0.08)',
              color: '#6f5d49',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            등록자: {user.email || '로그인 사용자'}
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <section
            style={{
              borderRadius: 24,
              background: '#fff',
              border: '1px solid rgba(47,36,23,0.08)',
              boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
              padding: 20,
            }}
          >
            {errorMessage ? (
              <div
                style={{
                  marginBottom: 14,
                  borderRadius: 14,
                  background: '#fff1f2',
                  border: '1px solid rgba(190,24,93,0.12)',
                  color: '#9f1239',
                  padding: '12px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <form action="/api/listings/create" method="post">
              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="title"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="예: 수익화 완료된 인스타그램 계정"
                  required
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 14,
                    border: '1px solid rgba(47,36,23,0.12)',
                    background: '#fffdf9',
                    padding: '0 14px',
                    fontSize: 14,
                    color: '#2f2417',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="category"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  카테고리
                </label>

                <CategoryDropdown name="category" required />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="price"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
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
                  placeholder="예: 1500000"
                  required
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 14,
                    border: '1px solid rgba(47,36,23,0.12)',
                    background: '#fffdf9',
                    padding: '0 14px',
                    fontSize: 14,
                    color: '#2f2417',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="transfer_method"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  이전 방식
                </label>
                <input
                  id="transfer_method"
                  name="transfer_method"
                  type="text"
                  placeholder="예: 계정 양도 / 관리자 권한 이전 / 도메인 푸시"
                  required
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 14,
                    border: '1px solid rgba(47,36,23,0.12)',
                    background: '#fffdf9',
                    padding: '0 14px',
                    fontSize: 14,
                    color: '#2f2417',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="description"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="자산 특징, 운영 기간, 수익 구조, 거래 조건 등을 입력하세요."
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    borderRadius: 14,
                    border: '1px solid rgba(47,36,23,0.12)',
                    background: '#fffdf9',
                    padding: '14px',
                    fontSize: 14,
                    color: '#2f2417',
                    resize: 'vertical',
                    lineHeight: 1.7,
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="status"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#2f2417',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="active"
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 14,
                    border: '1px solid rgba(47,36,23,0.12)',
                    background: '#fffdf9',
                    padding: '0 14px',
                    fontSize: 14,
                    color: '#2f2417',
                  }}
                >
                  <option value="active">거래가능</option>
                  <option value="hidden">숨김</option>
                  <option value="draft">임시저장</option>
                  <option value="sold">거래종료</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/listings"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 120,
                    height: 46,
                    padding: '0 18px',
                    borderRadius: 14,
                    background: '#eadfcf',
                    color: '#2f2417',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  취소
                </Link>

                <button
                  type="submit"
                  style={{
                    minWidth: 148,
                    height: 46,
                    border: 'none',
                    borderRadius: 14,
                    background: '#2f2417',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                    padding: '0 20px',
                  }}
                >
                  자산 등록하기
                </button>
              </div>
            </form>
          </section>

          <aside
            style={{
              display: 'grid',
              gap: 16,
            }}
          >
            <section
              style={{
                borderRadius: 24,
                background: '#fff',
                border: '1px solid rgba(47,36,23,0.08)',
                boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
                padding: 18,
              }}
            >
              <div
                style={{
                  color: '#9a6b2f',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                GUIDE
              </div>

              <div
                style={{
                  color: '#2f2417',
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  marginBottom: 12,
                }}
              >
                등록 팁
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 16,
                    background: '#fbf8f2',
                    padding: '14px 14px',
                  }}
                >
                  <div
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    1. 제목은 핵심만 짧고 강하게
                  </div>
                  <div
                    style={{
                      color: '#6f5d49',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    자산 종류와 강점을 한 줄에 드러내면 클릭률이 높아집니다.
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 16,
                    background: '#fbf8f2',
                    padding: '14px 14px',
                  }}
                >
                  <div
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    2. 이전 방식은 구체적으로
                  </div>
                  <div
                    style={{
                      color: '#6f5d49',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    계정 양도, 관리자 초대, 소유권 푸시 등 실제 이전 절차를 적어주세요.
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 16,
                    background: '#fbf8f2',
                    padding: '14px 14px',
                  }}
                >
                  <div
                    style={{
                      color: '#2f2417',
                      fontSize: 13,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    3. 설명에는 신뢰 요소 포함
                  </div>
                  <div
                    style={{
                      color: '#6f5d49',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    운영 기간, 수익 여부, 성장 추이, 거래 조건을 적으면 문의 전환이 좋아집니다.
                  </div>
                </div>
              </div>
            </section>

            <section
              style={{
                borderRadius: 24,
                background: '#fff',
                border: '1px solid rgba(47,36,23,0.08)',
                boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
                padding: 18,
              }}
            >
              <div
                style={{
                  color: '#9a6b2f',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                STATUS
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.08)',
                  }}
                >
                  <span
                    style={{
                      color: '#8d7760',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    거래가능
                  </span>
                  <span
                    style={{
                      color: '#166534',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    즉시 노출
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.08)',
                  }}
                >
                  <span
                    style={{
                      color: '#8d7760',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    숨김
                  </span>
                  <span
                    style={{
                      color: '#6f5d49',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    비노출
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(47,36,23,0.08)',
                  }}
                >
                  <span
                    style={{
                      color: '#8d7760',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    임시저장
                  </span>
                  <span
                    style={{
                      color: '#9a3412',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    작성중
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#8d7760',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    거래종료
                  </span>
                  <span
                    style={{
                      color: '#374151',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    종료 표시
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}