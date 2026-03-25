import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/my')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, email, phone_number, gender, role')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '32px 16px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          display: 'grid',
          gap: 18,
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 28,
            padding: 28,
            boxShadow: '0 16px 40px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#8a745b',
                  marginBottom: 10,
                }}
              >
                MY MSELL
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 32,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: '#241b11',
                }}
              >
                마이페이지
              </h1>

              <p
                style={{
                  margin: '12px 0 0',
                  color: '#6a5743',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                내 계정 정보와 거래 메뉴를 확인하세요.
              </p>
            </div>

            <Link href="/account" style={secondaryButtonStyle}>
              계정 수정
            </Link>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 24,
            padding: 22,
          }}
        >
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 18,
              fontWeight: 900,
              color: '#241b11',
            }}
          >
            계정 정보
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <InfoCard label="이름" value={profile?.full_name || '-'} />
            <InfoCard label="아이디" value={profile?.username || '-'} />
            <InfoCard label="이메일" value={profile?.email || user.email || '-'} />
            <InfoCard label="연락처" value={profile?.phone_number || '-'} />
            <InfoCard label="성별" value={profile?.gender || '-'} />
            <InfoCard label="권한" value={profile?.role || 'user'} />
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          <QuickLink
            href="/my/listings"
            title="내 등록글"
            description="내가 등록한 매물을 확인하고 수정하세요."
          />
          <QuickLink
            href="/my/deals"
            title="내 거래"
            description="진행 중인 거래방과 대화를 확인하세요."
          />
          <QuickLink
            href="/notifications"
            title="알림"
            description="새 메시지와 거래 알림을 확인하세요."
          />
          <QuickLink
            href="/listings/create"
            title="매물 등록"
            description="새 매물을 등록하고 공개하세요."
          />
        </section>
      </div>
    </main>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid #efe2d1',
        background: '#fffaf3',
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#8a745b',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#241b11',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        background: '#ffffff',
        border: '1px solid #eadfcf',
        borderRadius: 22,
        padding: 20,
        color: 'inherit',
        display: 'block',
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: '#241b11',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: '#6a5743',
        }}
      >
        {description}
      </div>
    </Link>
  )
}

const secondaryButtonStyle: React.CSSProperties = {
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '0 16px',
  borderRadius: 12,
  background: '#eadfcf',
  color: '#2f2417',
  fontSize: 14,
  fontWeight: 800,
}