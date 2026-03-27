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
        padding: '52px 20px 84px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(420px, 520px)',
            gap: 26,
            alignItems: 'start',
          }}
          className="login-layout"
        >
          <div
            style={{
              border: '1px solid #e5d9ca',
              background: 'linear-gradient(180deg, #fcfaf6 0%, #f7f1e8 100%)',
              borderRadius: 32,
              padding: '34px 34px 32px',
              boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
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
              MSELL ACCESS
            </div>

            <h1
              style={{
                margin: '18px 0 14px',
                fontSize: 56,
                lineHeight: 0.96,
                letterSpacing: '-0.05em',
                fontWeight: 900,
                color: '#1f1710',
              }}
            >
              더 간결하게
              <br />
              로그인하세요
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 560,
                color: '#6f655b',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              Msell의 브라운·베이지 톤과 맞춘 단일 로그인 화면입니다. 소셜 로그인과
              이메일 로그인을 한 장의 카드 안에 정리해, 브랜드 톤과 사용 흐름이
              자연스럽게 이어지도록 맞췄습니다.
            </p>

            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {[
                {
                  title: '빠른 진입',
                  desc: '구글·카카오·네이버를 바로 선택',
                },
                {
                  title: '단일 흐름',
                  desc: '중복 폼 없이 한 화면에서 완료',
                },
                {
                  title: '브랜드 정렬',
                  desc: '홈 화면과 같은 톤으로 통일',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    border: '1px solid #e4d8c8',
                    background: '#fffdfa',
                    borderRadius: 20,
                    padding: '16px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#20170f',
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: '#7a6d5f',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AuthGateway mode="login" next={next} />
        </section>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .login-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}