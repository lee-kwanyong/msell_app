import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'
import { loginAction } from './actions'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string
    success?: string
    message?: string
    next?: string
  }>
}) {
  const pageParams = searchParams ? await searchParams : undefined
  const error = pageParams?.error ?? ''
  const success = pageParams?.success ?? ''
  const message = pageParams?.message ?? ''
  const next = safeNextPath(pageParams?.next)

  const successText =
    success ||
    (message === 'signup_success' ? '회원가입이 완료되었습니다. 로그인해 주세요.' : '')

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '40px 16px 88px',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.08fr 0.92fr',
          gap: 22,
        }}
        className="msell-login-layout"
      >
        <section
          style={{
            background:
              'linear-gradient(135deg, rgba(47,36,23,1) 0%, rgba(73,56,36,1) 100%)',
            color: '#fffdf8',
            borderRadius: 30,
            padding: 34,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 18px 44px rgba(47, 36, 23, 0.14)',
            minHeight: 640,
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -80,
              top: -80,
              width: 240,
              height: 240,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -40,
              bottom: -60,
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
                color: 'rgba(255, 248, 236, 0.78)',
                marginBottom: 14,
              }}
            >
              MSELL ACCESS
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 40,
                lineHeight: 1.12,
                fontWeight: 900,
                letterSpacing: '-0.03em',
              }}
            >
              더 빠르게 로그인하고
              <br />
              바로 거래를 시작하세요
            </h1>

            <p
              style={{
                margin: '18px 0 0',
                maxWidth: 520,
                fontSize: 15,
                lineHeight: 1.85,
                color: 'rgba(255, 248, 236, 0.82)',
              }}
            >
              지금 Msell은 빠른 로그인과 직관적인 거래 진입이 핵심입니다.
              복잡한 설명보다 바로 행동할 수 있는 흐름으로 정리했습니다.
            </p>

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
              className="msell-login-feature-grid"
            >
              <FeatureCard
                title="빠른 진입"
                desc="로그인 후 바로 원하는 페이지로 복귀"
              />
              <FeatureCard
                title="안정적 인증"
                desc="구글 · 네이버 중심 로그인 동선"
              />
              <FeatureCard
                title="간단한 거래 시작"
                desc="목록 → 상세 → 문의까지 짧은 흐름"
              />
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'grid',
                gap: 10,
              }}
            >
              <MetricRow label="지원 로그인" value="Google / Naver" />
              <MetricRow label="가입 방식" value="이메일 또는 소셜" />
              <MetricRow label="복귀 경로" value={next} />
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
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#8a745b',
                marginBottom: 10,
              }}
            >
              LOGIN
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
              로그인
            </h2>

            <p
              style={{
                margin: '12px 0 0',
                fontSize: 14,
                lineHeight: 1.75,
                color: '#6a5743',
              }}
            >
              이메일 로그인 또는 소셜 로그인으로 바로 들어갈 수 있습니다.
            </p>
          </div>

          {error ? <div style={errorBoxStyle}>{decodeURIComponent(error)}</div> : null}
          {successText ? (
            <div style={successBoxStyle}>{decodeURIComponent(successText)}</div>
          ) : null}

          <form action={loginAction} style={{ display: 'grid', gap: 16 }}>
            <input type="hidden" name="next" value={next} />

            <Field label="이메일" required>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </Field>

            <Field label="비밀번호" required>
              <input
                type="password"
                name="password"
                required
                placeholder="비밀번호를 입력하세요"
                style={inputStyle}
              />
            </Field>

            <button type="submit" style={submitButtonStyle}>
              이메일로 로그인
            </button>
          </form>

          <div style={dividerWrapStyle}>
            <div style={dividerLineStyle} />
            <span style={dividerTextStyle}>SOCIAL LOGIN</span>
            <div style={dividerLineStyle} />
          </div>

          <AuthGateway next={next} />

          <div
            style={{
              marginTop: 20,
              display: 'grid',
              gap: 10,
              color: '#6b5845',
              fontSize: 14,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: '#fbf7f0',
                border: '1px solid #efe4d5',
                lineHeight: 1.7,
              }}
            >
              아직 계정이 없다면 회원가입 후 바로 로그인할 수 있습니다.
            </div>

            <Link
              href={`/auth/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #e4d6c2',
                background: '#fffaf4',
                color: '#241b11',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              회원가입으로 이동
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .msell-login-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .msell-login-feature-grid {
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

function FeatureCard({ title, desc }: { title: string; desc: string }) {
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

function MetricRow({ label, value }: { label: string; value: string }) {
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
          wordBreak: 'break-all',
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

const dividerWrapStyle: React.CSSProperties = {
  margin: '24px 0 18px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#eadfcf',
}

const dividerTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#8a745b',
}