import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

export default async function MobileLoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const next = params.next || '/m'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '20px 16px 32px',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            padding: '18px 4px 14px',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#8a6a43',
              marginBottom: 10,
            }}
          >
            MSELL MOBILE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.2,
              color: '#20170f',
              fontWeight: 800,
            }}
          >
            간편 로그인
          </h1>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 18,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.08)',
          }}
        >
          <AuthGateway mode="login" mobile />
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 14,
            color: '#6b5b4b',
            textAlign: 'center',
          }}
        >
          아직 계정이 없으신가요?{' '}
          <Link
            href={`/m/auth/signup?next=${encodeURIComponent(next)}`}
            style={{
              color: '#2f2417',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </main>
  )
}