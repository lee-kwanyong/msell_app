import Link from 'next/link'
import AuthGateway from '@/components/auth/AuthGateway'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const next = params.next || '/'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          border: '1px solid #eadfcf',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 20px 60px rgba(47, 36, 23, 0.08)',
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#8a6a43',
              marginBottom: 10,
            }}
          >
            MSELL LOGIN
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.2,
              color: '#20170f',
              fontWeight: 800,
            }}
          >
            로그인
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#6b5b4b',
            }}
          >
            구글, 네이버, 카카오로 바로 로그인할 수 있습니다.
          </p>
        </div>

        <AuthGateway mode="login" />

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
            href={`/auth/signup?next=${encodeURIComponent(next)}`}
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