import Link from 'next/link'
import { redirect } from 'next/navigation'
import CategoryDropdown from '@/components/listings/CategoryDropdown'
import { supabaseServer } from '@/lib/supabase/server'

type SearchParams = Promise<{
  error?: string
  success?: string
  category?: string
  title?: string
  price?: string
  transfer_method?: string
  description?: string
  status?: string
}>

const STATUS_OPTIONS = [
  { value: 'active', label: '거래가능' },
  { value: 'draft', label: '임시저장' },
  { value: 'hidden', label: '숨김' },
  { value: 'sold', label: '거래종료' },
]

function safeValue(value?: string) {
  return value ? decodeURIComponent(value) : ''
}

export default async function ListingCreatePage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/listings/create')
  }

  const params = searchParams ? await searchParams : undefined
  const error = safeValue(params?.error)
  const success = safeValue(params?.success)
  const initialCategory = safeValue(params?.category)
  const initialTitle = safeValue(params?.title)
  const initialPrice = safeValue(params?.price)
  const initialTransferMethod = safeValue(params?.transfer_method)
  const initialDescription = safeValue(params?.description)
  const initialStatus = safeValue(params?.status) || 'active'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '36px 16px 96px',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.06fr 0.94fr',
          gap: 22,
        }}
        className="msell-create-layout"
      >
        <section
          style={{
            borderRadius: 30,
            padding: 32,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 18px 44px rgba(47, 36, 23, 0.14)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 700,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -84,
              right: -84,
              width: 240,
              height: 240,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -40,
              bottom: -50,
              width: 180,
              height: 180,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'rgba(255,248,236,0.78)',
                marginBottom: 14,
              }}
            >
              NEW LISTING
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1.12,
                fontWeight: 900,
                letterSpacing: '-0.03em',
              }}
            >
              판매 자산을 등록하고
              <br />
              바로 거래를 시작하세요
            </h1>

            <p
              style={{
                margin: '18px 0 0',
                maxWidth: 560,
                fontSize: 15,
                lineHeight: 1.85,
                color: 'rgba(255,248,236,0.82)',
              }}
            >
              복잡한 입력보다 실제 거래에 필요한 정보만 남겼습니다. 제목, 카테고리,
              가격, 이전 방식, 설명, 상태만 입력하면 바로 공개할 수 있습니다.
            </p>

            <div
              style={{
                marginTop: 26,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
              className="msell-create-highlight-grid"
            >
              <HighlightCard
                title="입력 최소화"
                desc="핵심 필드만 남겨 등록 속도를 높였습니다."
              />
              <HighlightCard
                title="즉시 공개"
                desc="거래가능 상태로 두면 등록 직후 노출됩니다."
              />
              <HighlightCard
                title="운영 유연성"
                desc="임시저장 · 숨김 · 거래종료까지 바로 선택할 수 있습니다."
              />
            </div>

            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gap: 10,
              }}
            >
              <InfoRow label="입력 항목" value="제목 · 카테고리 · 가격 · 이전 방식 · 설명 · 상태" />
              <InfoRow label="등록 후 이동" value="등록 상세 페이지로 즉시 이동" />
              <InfoRow label="권장 상태" value="거래가능" />
            </div>

            <div
              style={{
                marginTop: 26,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Link href="/listings" style={secondaryLinkStyle}>
                거래목록 보기
              </Link>
              <Link href="/my/listings" style={ghostLinkStyle}>
                내 자산 보기
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 30,
            padding: 30,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 10,
              }}
            >
              CREATE LISTING
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.15,
                color: '#241b11',
                fontWeight: 900,
              }}
            >
              자산 등록
            </h2>

            <p
              style={{
                margin: '12px 0 0',
                fontSize: 14,
                lineHeight: 1.75,
                color: '#6a5743',
              }}
            >
              한 화면에서 빠르게 등록할 수 있도록 정리했습니다.
            </p>
          </div>

          {error ? <div style={errorBoxStyle}>{error}</div> : null}
          {success ? <div style={successBoxStyle}>{success}</div> : null}

          <form
            action="/api/listings/create"
            method="post"
            style={{
              display: 'grid',
              gap: 18,
            }}
          >
            <input type="hidden" name="error_return_to" value="/listings/create" />

            <Field label="제목" required>
              <input
                type="text"
                name="title"
                required
                defaultValue={initialTitle}
                placeholder="예: 인스타그램 계정 양도 / 유튜브 채널 매각"
                style={inputStyle}
              />
            </Field>

            <Field label="카테고리" required>
              <CategoryDropdown name="category" defaultValue={initialCategory} />
            </Field>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 14,
              }}
              className="msell-create-form-grid"
            >
              <Field label="희망 가격">
                <input
                  type="text"
                  name="price"
                  inputMode="numeric"
                  defaultValue={initialPrice}
                  placeholder="예: 5000000"
                  style={inputStyle}
                />
              </Field>

              <Field label="상태" required>
                <select
                  name="status"
                  defaultValue={initialStatus}
                  style={inputStyle}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="이전 방식">
              <input
                type="text"
                name="transfer_method"
                defaultValue={initialTransferMethod}
                placeholder="예: 계정 전체 이전 / 관리자 권한 이전 / 소스파일 전달"
                style={inputStyle}
              />
            </Field>

            <Field label="설명">
              <textarea
                name="description"
                defaultValue={initialDescription}
                placeholder="자산 상태, 운영 이력, 인수인계 범위, 주의사항 등을 적어주세요."
                style={textareaStyle}
              />
            </Field>

            <div
              style={{
                display: 'grid',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 16,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#241b11',
                }}
              >
                등록 전 체크
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: '#6a5743',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                <li>제목은 검색과 클릭률에 큰 영향을 줍니다.</li>
                <li>거래방식은 짧고 명확하게 적는 것이 좋습니다.</li>
                <li>즉시 노출하려면 상태를 ‘거래가능’으로 두세요.</li>
              </ul>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
              className="msell-create-action-grid"
            >
              <Link href="/listings" style={cancelLinkStyle}>
                취소
              </Link>

              <button type="submit" style={submitButtonStyle}>
                자산 등록하기
              </button>
            </div>
          </form>
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .msell-create-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .msell-create-highlight-grid,
          .msell-create-form-grid,
          .msell-create-action-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      style={{
        display: 'grid',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#241b11',
        }}
      >
        {label}
        {required ? <span style={{ color: '#9a3f2d', marginLeft: 4 }}>*</span> : null}
      </span>
      {children}
    </label>
  )
}

function HighlightCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: '16px 14px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(255,248,236,0.8)',
        }}
      >
        {desc}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        padding: '12px 14px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'rgba(255,248,236,0.72)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#fffaf2',
          textAlign: 'right',
          wordBreak: 'keep-all',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 16,
  border: '1px solid #e5d7c3',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 180,
  borderRadius: 16,
  border: '1px solid #e5d7c3',
  background: '#fffdf9',
  padding: '14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.7,
}

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 16,
  border: 'none',
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
}

const cancelLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 54,
  borderRadius: 16,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
}

const secondaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  padding: '0 16px',
  borderRadius: 16,
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
}

const ghostLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  padding: '0 16px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  color: '#fffaf2',
  textDecoration: 'none',
  fontWeight: 800,
}

const errorBoxStyle: React.CSSProperties = {
  marginBottom: 16,
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
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f4fbf4',
  border: '1px solid #d5ead5',
  color: '#2f6b3d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}