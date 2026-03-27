import AuthGateway from '@/components/auth/AuthGateway'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const next = getString(resolvedSearchParams?.next) || '/'

  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: 'calc(100vh - 72px)',
        padding: '56px 20px 84px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <AuthGateway mode="login" next={next} />
      </div>
    </main>
  )
}