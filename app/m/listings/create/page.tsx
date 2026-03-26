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

export default async function MobileListingCreatePage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/m/auth/login?next=/m/listings/create')
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
        padding: '20px 14px 110px',
      }}
    >
      <div
        style={{
          maxWidth: 620,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          style={{
            borderRadius: 24,
            padding: 22,
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            boxShadow: '0 16px 38px rgba(47, 36, 23, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255,248,236,0.78)',
              marginBottom: 8,
            }}
          >
            MOBILE CREATE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.18,
              fontWeight: 900,
            }}
          >
            모바일에서도
            <br />
            빠르게 자산 등록
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgba(255, 248, 236, 0.82)',
            }}
          >
            터치 동선에 맞춰 필드 순서와 버튼 배치를 단순하게 정리했습니다.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gap: 8,
            }}
          >
            <MiniInfo text="입력 필드: 제목 · 카테고리 · 가격 · 이전 방식 · 설명 · 상태" />
            <MiniInfo text="등록 후 상세 페이지로 바로 이동" />
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 14px 34px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 8,
              }}
            >
              CREATE LISTING
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.15,
                color: '#241b11',
                fontWeight: 900,
              }}
            >
              자산 등록
            </h2>
          </div>

          {error ? <div style={errorBoxStyle}>{error}</div> : null}
          {success ? <div style={successBoxStyle}>{success}</div> : null}

          <form
            action="/api/listings/create"
            method="post"
            style={{
              display: 'grid',
              gap: 14,
            }}
          >
            <input type="hidden" name="error_return_to" value="/m/listings/create" />

            <Field label="제목" required>
              <input
                type="text"
                name="title"
                required
                defaultValue={initialTitle}
                placeholder="예: 인스타그램 계정 양도"
                style={inputStyle}
              />
            </Field>

            <Field label="카테고리" required>
              <CategoryDropdown name="category" defaultValue={initialCategory} />
            </Field>

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

            <Field label="이전 방식">
              <input
                type="text"
                name="transfer_method"
                defaultValue={initialTransferMethod}
                placeholder="예: 전체 이전 / 권한 이전"
                style={inputStyle}
              />
            </Field>

            <Field label="설명">
              <textarea
                name="description"
                defaultValue={initialDescription}
                placeholder="자산 상태와 인수인계 범위를 적어주세요."
                style={textareaStyle}
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

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
                color: '#6a5743',
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              등록 직후 바로 노출하려면 상태를 <b style={{ color: '#241b11' }}>거래가능</b>으로
              두세요.
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <Link href="/m/listings" style={cancelLinkStyle}>
                취소
              </Link>

              <button type="submit" style={submitButtonStyle}>
                등록하기
              </button>
            </div>
          </form>
        </section>
      </div>
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
    <label style={{ display: 'grid', gap: 8 }}>
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

function MiniInfo({ text }: { text: string }) {
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
        wordBreak: 'keep-all',
      }}
    >
      {text}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  borderRadius: 14,
  border: '1px solid #e5d7c3',
  background: '#fffdf9',
  padding: '0 14px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 150,
  borderRadius: 14,
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
  minHeight: 52,
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
  minHeight: 52,
  borderRadius: 16,
  border: '1px solid #e4d6c2',
  background: '#fffaf4',
  color: '#241b11',
  textDecoration: 'none',
  fontWeight: 800,
}

const errorBoxStyle: React.CSSProperties = {
  marginBottom: 14,
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
  marginBottom: 14,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f4fbf4',
  border: '1px solid #d5ead5',
  color: '#2f6b3d',
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.6,
}