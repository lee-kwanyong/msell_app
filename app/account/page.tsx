import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { updateAccountAction } from './actions'

type SearchParams = Promise<{
  success?: string
  error?: string
}>

function getMessage(searchParams: { success?: string; error?: string }) {
  if (searchParams.success === '1') {
    return {
      type: 'success' as const,
      text: '계정 정보가 저장되었습니다.',
    }
  }

  if (searchParams.error) {
    return {
      type: 'error' as const,
      text: decodeURIComponent(searchParams.error),
    }
  }

  return null
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, phone_number')
    .eq('id', user.id)
    .single()

  const resolvedSearchParams = await searchParams
  const message = getMessage(resolvedSearchParams || {})

  const fullName = profile?.full_name || ''
  const username = profile?.username || ''
  const phoneNumber = profile?.phone_number || ''
  const email = user.email || ''

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '56px 20px 100px',
        }}
      >
        <div
          style={{
            marginBottom: 18,
          }}
        >
          <div
            style={{
              color: '#9a6b2f',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            ACCOUNT
          </div>
          <h1
            style={{
              margin: 0,
              color: '#2f2417',
              fontSize: 34,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              fontWeight: 900,
            }}
          >
            계정 설정
          </h1>
        </div>

        {message ? (
          <div
            style={{
              marginBottom: 14,
              borderRadius: 14,
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 700,
              background: message.type === 'success' ? '#ecfdf5' : '#fff1f2',
              color: message.type === 'success' ? '#166534' : '#9f1239',
              border:
                message.type === 'success'
                  ? '1px solid rgba(22,101,52,0.12)'
                  : '1px solid rgba(190,24,93,0.12)',
            }}
          >
            {message.text}
          </div>
        ) : null}

        <section
          style={{
            borderRadius: 24,
            background: '#fff',
            border: '1px solid rgba(47,36,23,0.08)',
            boxShadow: '0 10px 28px rgba(47,36,23,0.05)',
            padding: 22,
          }}
        >
          <form action={updateAccountAction}>
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="full_name"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#2f2417',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                이름
              </label>
              <input
                id="full_name"
                name="full_name"
                defaultValue={fullName}
                placeholder="이름을 입력하세요"
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.12)',
                  background: '#fffdf9',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#2f2417',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#2f2417',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                아이디
              </label>
              <input
                id="username"
                name="username"
                defaultValue={username}
                placeholder="아이디를 입력하세요"
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.12)',
                  background: '#fffdf9',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#2f2417',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="phone_number"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#2f2417',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                연락처
              </label>
              <input
                id="phone_number"
                name="phone_number"
                defaultValue={phoneNumber}
                placeholder="연락처를 입력하세요"
                required
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.12)',
                  background: '#fffdf9',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#2f2417',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#2f2417',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(47,36,23,0.08)',
                  background: '#f7f2ea',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#7a6753',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                style={{
                  minWidth: 120,
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
                저장하기
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}