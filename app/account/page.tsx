import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { updateAccountAction } from './actions';

export const dynamic = 'force-dynamic';

type ResolvedSearchParams = Record<string, string | string[] | undefined>;

type AccountPageProps = {
  searchParams?: Promise<ResolvedSearchParams>;
};

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps) {
  const supabase = await supabaseServer();

  const [
    {
      data: { user },
      error: userError,
    },
    resolvedSearchParams,
  ] = await Promise.all([
    supabase.auth.getUser(),
    (searchParams ?? Promise.resolve({} as ResolvedSearchParams)) as Promise<ResolvedSearchParams>,
  ]);

  if (userError || !user) {
    redirect('/auth/login?next=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, phone_number, gender, email')
    .eq('id', user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? '';
  const username =
    profile?.username ?? (user.user_metadata?.username as string | undefined) ?? '';
  const phoneNumber =
    profile?.phone_number ??
    (user.user_metadata?.phone_number as string | undefined) ??
    '';
  const gender =
    profile?.gender ?? (user.user_metadata?.gender as string | undefined) ?? '';
  const email = profile?.email ?? user.email ?? '';

  const updated = pickFirst(resolvedSearchParams.updated) === '1';
  const error = pickFirst(resolvedSearchParams.error);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#f6f1e7',
        padding: '32px 20px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #eadfcf',
            borderRadius: 28,
            padding: '28px 24px',
            boxShadow: '0 20px 60px rgba(47, 36, 23, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: 'fit-content',
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: '#f6efe4',
                  color: '#7a5a33',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ACCOUNT
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.1,
                  color: '#24170f',
                  letterSpacing: '-0.04em',
                }}
              >
                내 계정
              </h1>

              <p
                style={{
                  margin: 0,
                  color: '#6b5b4d',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                계정 기본 정보와 프로필 값을 관리할 수 있습니다.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/my/listings"
                style={{
                  textDecoration: 'none',
                  height: 42,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1px solid #e5d7c4',
                  background: '#ffffff',
                  color: '#2f2417',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                내 자산
              </Link>

              <Link
                href="/my/deals"
                style={{
                  textDecoration: 'none',
                  height: 42,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1px solid #e5d7c4',
                  background: '#ffffff',
                  color: '#2f2417',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                내 거래
              </Link>
            </div>
          </div>

          {updated ? (
            <div
              style={{
                marginBottom: 16,
                borderRadius: 16,
                border: '1px solid #cfe7d4',
                background: '#f2fbf5',
                color: '#1f6b3b',
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
                marginBottom: 16,
                borderRadius: 16,
                border: '1px solid #efc9c2',
                background: '#fff5f3',
                color: '#9a3412',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 700,
                wordBreak: 'break-word',
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
              gap: 18,
            }}
          >
            <form
              action={updateAccountAction}
              style={{
                display: 'grid',
                gap: 16,
                padding: 20,
                borderRadius: 22,
                border: '1px solid #eee4d7',
                background: '#fffdf9',
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <label
                  htmlFor="email"
                  style={{ fontSize: 13, fontWeight: 800, color: '#5c4630' }}
                >
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  value={email}
                  readOnly
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 14,
                    border: '1px solid #e6dac9',
                    background: '#f5efe6',
                    padding: '0 16px',
                    color: '#7a6a59',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label
                  htmlFor="full_name"
                  style={{ fontSize: 13, fontWeight: 800, color: '#5c4630' }}
                >
                  이름
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  defaultValue={fullName}
                  placeholder="이름을 입력하세요"
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 14,
                    border: '1px solid #e6dac9',
                    background: '#ffffff',
                    padding: '0 16px',
                    color: '#24170f',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label
                  htmlFor="username"
                  style={{ fontSize: 13, fontWeight: 800, color: '#5c4630' }}
                >
                  사용자명
                </label>
                <input
                  id="username"
                  name="username"
                  defaultValue={username}
                  placeholder="사용자명을 입력하세요"
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 14,
                    border: '1px solid #e6dac9',
                    background: '#ffffff',
                    padding: '0 16px',
                    color: '#24170f',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 14,
                }}
              >
                <div style={{ display: 'grid', gap: 8 }}>
                  <label
                    htmlFor="phone_number"
                    style={{ fontSize: 13, fontWeight: 800, color: '#5c4630' }}
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
                      borderRadius: 14,
                      border: '1px solid #e6dac9',
                      background: '#ffffff',
                      padding: '0 16px',
                      color: '#24170f',
                      fontSize: 15,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <label
                    htmlFor="gender"
                    style={{ fontSize: 13, fontWeight: 800, color: '#5c4630' }}
                  >
                    성별
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={gender}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 14,
                      border: '1px solid #e6dac9',
                      background: '#ffffff',
                      padding: '0 16px',
                      color: '#24170f',
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
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  flexWrap: 'wrap',
                  paddingTop: 4,
                }}
              >
                <Link
                  href="/"
                  style={{
                    textDecoration: 'none',
                    height: 48,
                    padding: '0 18px',
                    borderRadius: 14,
                    border: '1px solid #e5d7c4',
                    background: '#eadfcf',
                    color: '#2f2417',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
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
                    background: '#2f2417',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  저장하기
                </button>
              </div>
            </form>

            <div
              style={{
                display: 'grid',
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 22,
                  border: '1px solid #eee4d7',
                  background: '#fffdf9',
                  padding: 20,
                  display: 'grid',
                  gap: 14,
                }}
              >
                <div style={{ display: 'grid', gap: 6 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: '#24170f',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    계정 요약
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: '#6b5b4d',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    현재 로그인된 계정의 기본 상태입니다.
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <SummaryRow label="이메일" value={email || '-'} />
                  <SummaryRow label="이름" value={fullName || '-'} />
                  <SummaryRow label="사용자명" value={username || '-'} />
                  <SummaryRow label="연락처" value={phoneNumber || '-'} />
                  <SummaryRow
                    label="성별"
                    value={
                      gender === 'male'
                        ? '남성'
                        : gender === 'female'
                          ? '여성'
                          : gender === 'other'
                            ? '기타'
                            : '-'
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  border: '1px solid #eee4d7',
                  background: '#fffdf9',
                  padding: 20,
                  display: 'grid',
                  gap: 12,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    color: '#24170f',
                    letterSpacing: '-0.03em',
                  }}
                >
                  빠른 이동
                </h2>

                <QuickLink href="/listings/create" label="새 자산 등록" />
                <QuickLink href="/notifications" label="알림 확인" />
                <QuickLink href="/my/listings" label="내 자산 관리" />
                <QuickLink href="/my/deals" label="내 거래 관리" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 6,
        padding: '12px 14px',
        borderRadius: 16,
        border: '1px solid #efe5d8',
        background: '#faf6ef',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#7a5a33',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#24170f',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        minHeight: 50,
        borderRadius: 16,
        border: '1px solid #efe5d8',
        background: '#faf6ef',
        color: '#2f2417',
        fontWeight: 800,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {label}
    </Link>
  );
}