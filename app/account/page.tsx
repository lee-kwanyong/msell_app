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
    (typeof user.user_metadata?.phone_number === 'string' ? user.user_metadata.phone_number : '') ??
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
        padding: '40px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <section
          style={{
            border: '1px solid #e4d8c8',
            background: 'linear-gradient(180deg, #ffffff 0%, #fcfaf6 100%)',
            borderRadius: 32,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(47,36,23,0.08)',
          }}
        >
          <div
            style={{
              padding: '34px 34px 26px',
              borderBottom: '1px solid #eee1d2',
              background:
                'radial-gradient(circle at top right, rgba(234,223,207,0.75), transparent 32%), linear-gradient(180deg, #fffdfa 0%, #f9f4ec 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 20,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 280, flex: '1 1 560px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 12px',
                    borderRadius: 999,
                    background: '#f1e7d8',
                    color: '#6c5334',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Account Center
                </div>

                <h1
                  style={{
                    margin: '16px 0 10px',
                    fontSize: 42,
                    lineHeight: 1.08,
                    color: '#20170f',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                  }}
                >
                  내 계정
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: '#6c6258',
                    fontSize: 15,
                    lineHeight: 1.7,
                    maxWidth: 720,
                  }}
                >
                  프로필, 연락처, 계정 상태를 한 화면에서 관리합니다. Msell의 전체 거래
                  흐름과 연결되는 기본 정보 영역입니다.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(110px, 1fr))',
                  gap: 12,
                  minWidth: 320,
                  flex: '0 0 auto',
                }}
              >
                <Link
                  href="/my/listings"
                  style={{
                    textDecoration: 'none',
                    border: '1px solid #e3d6c4',
                    background: '#fff',
                    color: '#2f2417',
                    borderRadius: 18,
                    padding: '16px 14px',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(47,36,23,0.05)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#8b7760', marginBottom: 6 }}>자산</div>
                  <div style={{ fontSize: 20 }}>{listingCount ?? 0}</div>
                </Link>

                <Link
                  href="/my/deals"
                  style={{
                    textDecoration: 'none',
                    border: '1px solid #e3d6c4',
                    background: '#fff',
                    color: '#2f2417',
                    borderRadius: 18,
                    padding: '16px 14px',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(47,36,23,0.05)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#8b7760', marginBottom: 6 }}>거래</div>
                  <div style={{ fontSize: 20 }}>{dealCount ?? 0}</div>
                </Link>

                <Link
                  href="/notifications"
                  style={{
                    textDecoration: 'none',
                    border: '1px solid #e3d6c4',
                    background: '#fff',
                    color: '#2f2417',
                    borderRadius: 18,
                    padding: '16px 14px',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(47,36,23,0.05)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#8b7760', marginBottom: 6 }}>알림</div>
                  <div style={{ fontSize: 20 }}>{unreadCount ?? 0}</div>
                </Link>
              </div>
            </div>
          </div>

          <div style={{ padding: 28 }}>
            {saved === '1' ? (
              <div
                style={{
                  marginBottom: 18,
                  borderRadius: 18,
                  border: '1px solid #d5e7d0',
                  background: '#f4fbf1',
                  color: '#2a5a21',
                  padding: '14px 16px',
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
                  borderRadius: 18,
                  border: '1px solid #efc6c1',
                  background: '#fff4f2',
                  color: '#8a2f25',
                  padding: '14px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.45fr) minmax(340px, 0.95fr)',
                gap: 22,
                alignItems: 'start',
              }}
              className="account-grid"
            >
              <div
                style={{
                  border: '1px solid #eadfce',
                  background: '#fff',
                  borderRadius: 28,
                  padding: 22,
                  boxShadow: '0 14px 40px rgba(47,36,23,0.04)',
                }}
              >
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#8d765a',
                      fontWeight: 800,
                      marginBottom: 8,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    프로필 편집
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      color: '#20170f',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    기본 정보 관리
                  </h2>
                </div>

                <form action={updateAccountAction}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 16,
                    }}
                    className="account-form-grid"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#3f3121',
                        }}
                      >
                        이메일
                      </label>
                      <input
                        id="email"
                        value={email}
                        disabled
                        style={{
                          width: '100%',
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #e6d8c6',
                          background: '#f7f2ea',
                          padding: '0 16px',
                          color: '#7b6e5f',
                          fontSize: 15,
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
                          fontWeight: 800,
                          color: '#3f3121',
                        }}
                      >
                        계정 등급
                      </label>
                      <input
                        id="role"
                        value={roleLabel(role)}
                        disabled
                        style={{
                          width: '100%',
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #e6d8c6',
                          background: '#f7f2ea',
                          padding: '0 16px',
                          color: '#7b6e5f',
                          fontSize: 15,
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
                          fontWeight: 800,
                          color: '#3f3121',
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
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 16px',
                          color: '#221a12',
                          fontSize: 15,
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
                          fontWeight: 800,
                          color: '#3f3121',
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
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 16px',
                          color: '#221a12',
                          fontSize: 15,
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
                          fontWeight: 800,
                          color: '#3f3121',
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
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 16px',
                          color: '#221a12',
                          fontSize: 15,
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
                          fontWeight: 800,
                          color: '#3f3121',
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
                          height: 54,
                          borderRadius: 16,
                          border: '1px solid #dfd1bf',
                          background: '#fffdfa',
                          padding: '0 16px',
                          color: '#221a12',
                          fontSize: 15,
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
                      marginTop: 18,
                      padding: 18,
                      borderRadius: 22,
                      border: '1px solid #eee1d2',
                      background: 'linear-gradient(180deg, #fdfaf6 0%, #f7f1e8 100%)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: '#2f2417',
                        marginBottom: 8,
                      }}
                    >
                      계정 안내
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: '#756858',
                      }}
                    >
                      저장 시 profiles와 auth user metadata를 함께 갱신합니다. 이메일은
                      인증 계정 기준으로 유지됩니다.
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      marginTop: 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href="/"
                      style={{
                        textDecoration: 'none',
                        height: 50,
                        padding: '0 18px',
                        borderRadius: 16,
                        border: '1px solid #e2d5c4',
                        background: '#f7efe4',
                        color: '#2f2417',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      홈으로
                    </Link>

                    <button
                      type="submit"
                      style={{
                        height: 52,
                        padding: '0 22px',
                        borderRadius: 16,
                        border: 'none',
                        background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
                        color: '#fffaf3',
                        fontWeight: 900,
                        fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 18px 30px rgba(47,36,23,0.2)',
                      }}
                    >
                      계정 저장
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'grid', gap: 18 }}>
                <section
                  style={{
                    border: '1px solid #eadfce',
                    background: '#fff',
                    borderRadius: 28,
                    padding: 22,
                    boxShadow: '0 14px 40px rgba(47,36,23,0.04)',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 21,
                      color: '#20170f',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    계정 요약
                  </h3>
                  <p
                    style={{
                      margin: '8px 0 18px',
                      color: '#7a6e61',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    현재 저장된 핵심 프로필입니다.
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
                          borderRadius: 18,
                          padding: '13px 14px',
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

                <section
                  style={{
                    border: '1px solid #eadfce',
                    background: '#fff',
                    borderRadius: 28,
                    padding: 22,
                    boxShadow: '0 14px 40px rgba(47,36,23,0.04)',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 21,
                      color: '#20170f',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    빠른 이동
                  </h3>
                  <p
                    style={{
                      margin: '8px 0 18px',
                      color: '#7a6e61',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    자주 쓰는 메뉴로 바로 이동합니다.
                  </p>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {[
                      { href: '/listings/create', label: '새 자산 등록', desc: '새 거래 자산 올리기' },
                      { href: '/my/listings', label: '내 자산 관리', desc: '등록한 자산 확인' },
                      { href: '/my/deals', label: '내 거래 관리', desc: '진행 중 거래 확인' },
                      { href: '/notifications', label: '알림 확인', desc: '미확인 알림 확인' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          textDecoration: 'none',
                          border: '1px solid #eadfce',
                          background: 'linear-gradient(180deg, #fffdfa 0%, #f8f1e7 100%)',
                          borderRadius: 18,
                          padding: '14px 15px',
                          color: '#2f2417',
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 13, color: '#7b6f62' }}>{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .account-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .account-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}