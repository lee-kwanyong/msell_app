import Link from 'next/link'
import { signupAction } from '@/app/auth/signup/actions'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export default async function MobileSignupPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const next = safeNextPath(params.next)
  const error = params.error ? decodeURIComponent(params.error) : ''

  return (
    <div style={pageStyle}>
      <section style={cardStyle}>
        <div style={badgeStyle}>MSELL SIGNUP</div>

        <h1 style={titleStyle}>모바일 회원가입</h1>

        <p style={descStyle}>
          모바일 전용 흐름으로 기본 정보를 입력하고 계정을 만들 수 있습니다.
        </p>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <form action={signupAction} style={formStyle}>
          <input type="hidden" name="next" value={next} />

          <label style={labelStyle}>
            <span style={labelTextStyle}>이름</span>
            <input
              type="text"
              name="full_name"
              required
              placeholder="이름을 입력하세요"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>성별</span>
            <select name="gender" required style={inputStyle}>
              <option value="">성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>연락처</span>
            <input
              type="tel"
              name="phone_number"
              required
              placeholder="연락처를 입력하세요"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>이메일</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>비밀번호</span>
            <input
              type="password"
              name="password"
              required
              placeholder="비밀번호를 입력하세요"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>비밀번호 확인</span>
            <input
              type="password"
              name="password_confirm"
              required
              placeholder="비밀번호를 다시 입력하세요"
              style={inputStyle}
            />
          </label>

          <button type="submit" style={submitButtonStyle}>
            회원가입 완료
          </button>
        </form>

        <div style={footerStyle}>
          <span style={footerTextStyle}>이미 계정이 있나요?</span>
          <Link href={`/m/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} style={footerButtonStyle}>
            로그인
          </Link>
        </div>

        <div style={bottomLinksStyle}>
          <Link href="/auth/signup?view=desktop" style={textLinkStyle}>
            웹 회원가입 보기
          </Link>
          <Link href="/m" style={textLinkStyle}>
            모바일 홈
          </Link>
        </div>
      </section>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  margin: '0 auto',
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dccfbe',
  borderRadius: 28,
  padding: 24,
  boxShadow: '0 18px 50px rgba(47, 36, 23, 0.08)',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  minHeight: 30,
  alignItems: 'center',
  padding: '0 12px',
  borderRadius: 999,
  background: '#f3ebdf',
  color: '#72593f',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
}

const titleStyle: React.CSSProperties = {
  margin: '16px 0 0',
  fontSize: 30,
  lineHeight: 1.08,
  letterSpacing: '-0.05em',
  color: '#241b11',
}

const descStyle: React.CSSProperties = {
  margin: '12px 0 0',
  color: '#7c6754',
  fontSize: 15,
  lineHeight: 1.7,
  wordBreak: 'keep-all',
}

const errorBoxStyle: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 14,
  background: '#fff4f2',
  border: '1px solid #f1d0c8',
  color: '#9a3f2d',
  fontSize: 14,
  fontWeight: 700,
  padding: '14px 16px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}

const formStyle: React.CSSProperties = {
  marginTop: 18,
  display: 'grid',
  gap: 14,
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
}

const labelTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#241b11',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  borderRadius: 14,
  border: '1px solid #ddcfba',
  background: '#fffdf9',
  padding: '0 16px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
}

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 14,
  border: '1px solid #2f2417',
  background: '#2f2417',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
}

const footerStyle: React.CSSProperties = {
  marginTop: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

const footerTextStyle: React.CSSProperties = {
  color: '#7c6754',
  fontSize: 14,
  fontWeight: 700,
}

const footerButtonStyle: React.CSSProperties = {
  minHeight: 42,
  padding: '0 16px',
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#eadfcf',
  border: '1px solid #eadfcf',
  color: '#2f2417',
  fontSize: 14,
  fontWeight: 800,
  textDecoration: 'none',
}

const bottomLinksStyle: React.CSSProperties = {
  marginTop: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}

const textLinkStyle: React.CSSProperties = {
  color: '#2f2417',
  fontSize: 14,
  fontWeight: 800,
  textDecoration: 'none',
}