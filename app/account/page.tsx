import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { updateAccountAction } from './actions'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function roleLabel(role?: string | null) {
  if (!role) return '일반 사용자'
  if (role === 'admin') return '관리자'
  return role
}

function genderLabel(gender?: string | null) {
  if (!gender) return '-'
  if (gender === 'male') return '남성'
  if (gender === 'female') return '여성'
  if (gender === 'other') return '기타'
  return gender
}

function maskEmail(email?: string | null) {
  if (!email) return '-'
  const [id, domain] = email.split('@')
  if (!domain) return email
  if (id.length <= 3) return `${id[0] ?? '*'}**@${domain}`
  return `${id.slice(0, 3)}${'*'.repeat(Math.max(1, id.length - 3))}@${domain}`
}

function formatJoinDate(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await supabaseServer()

  const [
    {
      data: { user },
    },
    resolvedSearchParams,
  ] = await Promise.all([supabase.auth.getUser(), searchParams])

  if (!user) {
    redirect('/auth/login?next=/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { count: listingCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: dealCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const email = user.email ?? ''
  const fullName =
    profile?.full_name ??
    (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '') ??
    ''
  const username =
    profile?.username ??
    (typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : '') ??
    ''
  const phoneNumber =
    profile?.phone_number ??
    (typeof user.user_metadata?.phone_number === 'string'
      ? user.user_metadata.phone_number
      : '') ??
    ''
  const gender =
    profile?.gender ??
    (typeof user.user_metadata?.gender === 'string' ? user.user_metadata.gender : '') ??
    ''
  const role = profile?.role ?? 'user'

  const saved = getString(resolvedSearchParams?.saved)
  const error = getString(resolvedSearchParams?.error)

  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: 'calc(100vh - 72px)',
        padding: '44px 20px 84px',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <section
          style={{
            border: '1px solid #e5d9ca',
            background: '#fcfaf6',
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
          }}
        >
          <div
            style={{
              padding: '30px 32px 26px',
              borderBottom: '1px solid #ece0d2',
              background: 'linear-gradient(180deg, #fcfaf6 0%, #f7f1e8 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 20,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 260, flex: '1 1 520px' }}>
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
                  ACCOUNT CENTER
                </div>

                <h1
                  style={{
                    margin: '16px 0 10px',
                    fontSize: 42,
                    lineHeight: 1.04,
                    letterSpacing: '-0.04em',
                    fontWeight: 900,
                    color: '#1f1710',
                  }}
                >
                  내 계정
                </h1>

                <p
                  style={{
                    margin: 0,
                    maxWidth: 640,
                    color: '#6f655b',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  프로필과 기본 계정 정보를 정리하는 공간입니다. 복잡한 요소는 줄이고,
                  필요한 정보만 안정적으로 보이도록 구성했습니다.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 74px)',
                  gap: 10,
                }}
              >
                {[
                  { label: '자산', value: listingCount ?? 0 },
                  { label: '거래', value: dealCount ?? 0 },
                  { label: '알림', value: unreadCount ?? 0 },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      border: '1px solid #e2d5c4',
                      background: '#fff',
                      borderRadius: 18,
                      height: 74,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 8px 18px rgba(47,36,23,0.04)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: '#8b7760',
                        fontWeight: 800,
                        marginBottom: 6,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        lineHeight: 1,
                        color: '#1f1710',
                        fontWeight: 900,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: 28 }}>
            {saved === '1' ? (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: 16,
                  border: '1px solid #d8e7d0',
                  background: '#f5fbf1',
                  color: '#2a5a21',
                  padding: '13px 15px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                계정 정보가 저장되었습니다.
              </div>
            ) : null}

            {error ? (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: 16,
                  border: '1px solid #efcdc8',
                  background: '#fff4f2',
                  color: '#8a2f25',
                  padding: '13px 15px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            ) : null}

            <div
              className="account-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)',
                gap: 20,
                alignItems: 'start',
              }}
            >
              <section
                style={{
                  border: '1px solid #e8dccd',
                  background: '#fff',
                  borderRadius: 26,
                  padding: 22,
                }}
              >
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#8a7458',
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    프로필 편집
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      lineHeight: 1.15,
                      color: '#1f1710',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    기본 정보 관리
                  </h2>
                </div>

                <form action={updateAccountAction}>
                  <div
                    className="account-form-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 14,
                    }}
                  >
                    <div>
                      <label
                        htmlFor="email"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
                          fontWeight: 800,
                        }}
                      >
                        이메일
                      </label>
                      <input
                        id="email"
                        value={email}
                        disabled
                        readOnly
                        style={{
                          width: '100%',
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #e6d8c6',
                          background: '#f7f1e7',
                          padding: '0 15px',
                          color: '#7c6e5f',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
                          fontWeight: 800,
                        }}
                      >
                        계정 등급
                      </label>
                      <input
                        id="role"
                        value={roleLabel(role)}
                        disabled
                        readOnly
                        style={{
                          width: '100%',
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #e6d8c6',
                          background: '#f7f1e7',
                          padding: '0 15px',
                          color: '#7c6e5f',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="full_name"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
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
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 15px',
                          color: '#221a12',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="username"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
                          fontWeight: 800,
                        }}
                      >
                        사용자명
                      </label>
                      <input
                        id="username"
                        name="username"
                        defaultValue={username}
                        placeholder="username"
                        style={{
                          width: '100%',
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 15px',
                          color: '#221a12',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone_number"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
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
                        style={{
                          width: '100%',
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 15px',
                          color: '#221a12',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="gender"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          color: '#3f3121',
                          fontWeight: 800,
                        }}
                      >
                        성별
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        defaultValue={gender || ''}
                        style={{
                          width: '100%',
                          height: 52,
                          borderRadius: 15,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 15px',
                          color: '#221a12',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      >
                        <option value="">선택 안 함</option>
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                        <option value="other">기타</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      border: '1px solid #eee2d3',
                      background: '#faf5ee',
                      borderRadius: 18,
                      padding: '16px 17px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#2f2417',
                        marginBottom: 6,
                      }}
                    >
                      계정 안내
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: '#756858',
                      }}
                    >
                      저장 시 profiles와 auth user metadata를 함께 갱신합니다. 이메일은
                      현재 인증 계정 기준으로 유지됩니다.
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 18,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href="/"
                      style={{
                        height: 46,
                        padding: '0 16px',
                        borderRadius: 14,
                        border: '1px solid #e0d4c4',
                        background: '#f7efe4',
                        color: '#2f2417',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      홈으로
                    </Link>

                    <button
                      type="submit"
                      style={{
                        height: 48,
                        padding: '0 20px',
                        borderRadius: 14,
                        border: 'none',
                        background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
                        color: '#fffaf3',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(47,36,23,0.18)',
                      }}
                    >
                      계정 저장
                    </button>
                  </div>
                </form>
              </section>

              <section
                style={{
                  border: '1px solid #e8dccd',
                  background: '#fff',
                  borderRadius: 26,
                  padding: 22,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 24,
                    lineHeight: 1.1,
                    color: '#1f1710',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                  }}
                >
                  계정 요약
                </h3>

                <p
                  style={{
                    margin: '10px 0 18px',
                    fontSize: 14,
                    color: '#7a6d5f',
                    lineHeight: 1.65,
                  }}
                >
                  현재 저장된 핵심 계정 정보를 간결하게 정리했습니다.
                </p>

                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    ['이메일', maskEmail(email)],
                    ['이름', fullName || '-'],
                    ['사용자명', username || '-'],
                    ['연락처', phoneNumber || '-'],
                    ['성별', genderLabel(gender)],
                    ['권한', roleLabel(role)],
                    ['가입일', formatJoinDate(user.created_at)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        border: '1px solid #ede1d0',
                        background: '#fcf8f2',
                        borderRadius: 16,
                        padding: '12px 14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#8b7760',
                          fontWeight: 800,
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          color: '#20170f',
                          fontWeight: 800,
                          wordBreak: 'break-word',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .account-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .account-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}