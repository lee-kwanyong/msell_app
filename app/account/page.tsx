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

function displayGender(value: string) {
  if (value === 'male') return '남성';
  if (value === 'female') return '여성';
  if (value === 'other') return '기타';
  return '-';
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
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
    .select('full_name, username, phone_number, gender, email, role')
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
  const role = typeof profile?.role === 'string' ? profile.role : 'user';

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
          maxWidth: 1120,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <section
          style={{
            borderRadius: 30,
            border: '1px solid #eadfcf',
            background: '#ffffff',
            boxShadow: '0 24px 80px rgba(47, 36, 23, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '28px 28px 22px',
              borderBottom: '1px solid #efe5d8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
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
                  fontWeight: 800,
                }}
              >
                ACCOUNT
              </div>

              <h1
                style={{
                  margin: 0,
                  color: '#24170f',
                  fontSize: 34,
                  lineHeight: 1.08,
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
                기본 프로필, 연락처, 계정 상태를 한 번에 관리합니다.
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
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 14,
                  border: '1px solid #e5d7c4',
                  background: '#ffffff',
                  color: '#2f2417',
                  fontSize: 14,
                  fontWeight: 800,
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
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 14,
                  border: '1px solid #e5d7c4',
                  background: '#ffffff',
                  color: '#2f2417',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                내 거래
              </Link>

              <Link
                href="/notifications"
                style={{
                  textDecoration: 'none',
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 14,
                  border: '1px solid #e5d7c4',
                  background: '#eadfcf',
                  color: '#2f2417',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                알림
              </Link>
            </div>
          </div>

          <div
            style={{
              padding: 28,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 0.9fr)',
              gap: 20,
            }}
          >
            <div style={{ display: 'grid', gap: 16 }}>
              {updated ? (
                <div
                  style={{
                    borderRadius: 16,
                    border: '1px solid #cfe7d4',
                    background: '#f2fbf5',
                    color: '#1f6b3b',
                    padding: '14px 16px',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  계정 정보가 저장되었습니다.
                </div>
              ) : null}

              {error ? (
                <div
                  style={{
                    borderRadius: 16,
                    border: '1px solid #efc9c2',
                    background: '#fff5f3',
                    color: '#9a3412',
                    padding: '14px 16px',
                    fontSize: 14,
                    fontWeight: 800,
                    wordBreak: 'break-word',
                  }}
                >
                  {error}
                </div>
              ) : null}

              <form
                action={updateAccountAction}
                style={{
                  display: 'grid',
                  gap: 16,
                  borderRadius: 24,
                  border: '1px solid #eee4d7',
                  background: '#fffdf9',
                  padding: 22,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  <Field label="이메일">
                    <input
                      name="email"
                      value={email}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </Field>

                  <Field label="계정 등급">
                    <input
                      value={role === 'admin' ? '관리자' : '일반 사용자'}
                      readOnly
                      style={readOnlyInputStyle}
                    />
                  </Field>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  <Field label="이름" htmlFor="full_name">
                    <input
                      id="full_name"
                      name="full_name"
                      defaultValue={fullName}
                      placeholder="이름을 입력하세요"
                      required
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="사용자명" htmlFor="username">
                    <input
                      id="username"
                      name="username"
                      defaultValue={username}
                      placeholder="사용자명을 입력하세요"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  <Field label="연락처" htmlFor="phone_number">
                    <input
                      id="phone_number"
                      name="phone_number"
                      defaultValue={phoneNumber}
                      placeholder="연락처를 입력하세요"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="성별" htmlFor="gender">
                    <select
                      id="gender"
                      name="gender"
                      defaultValue={gender}
                      style={inputStyle}
                    >
                      <option value="">선택 안 함</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </Field>
                </div>

                <div
                  style={{
                    borderRadius: 18,
                    border: '1px solid #efe5d8',
                    background: '#faf6ef',
                    padding: 16,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      color: '#24170f',
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    계정 안내
                  </div>
                  <div
                    style={{
                      color: '#6b5b4d',
                      fontSize: 14,
                      lineHeight: 1.65,
                    }}
                  >
                    저장 시 profiles와 auth user metadata가 함께 갱신됩니다.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
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
                      padding: '0 22px',
                      borderRadius: 14,
                      border: 'none',
                      background: '#2f2417',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    계정 저장
                  </button>
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <Panel
                title="계정 요약"
                description="현재 저장된 핵심 프로필 값입니다."
              >
                <SummaryRow label="이메일" value={email || '-'} />
                <SummaryRow label="이름" value={fullName || '-'} />
                <SummaryRow label="사용자명" value={username || '-'} />
                <SummaryRow label="연락처" value={phoneNumber || '-'} />
                <SummaryRow label="성별" value={displayGender(gender)} />
                <SummaryRow
                  label="권한"
                  value={role === 'admin' ? '관리자' : '일반 사용자'}
                />
              </Panel>

              <Panel
                title="빠른 이동"
                description="자주 쓰는 메뉴로 바로 이동합니다."
              >
                <QuickLink href="/listings/create" label="새 자산 등록" />
                <QuickLink href="/my/listings" label="내 자산 관리" />
                <QuickLink href="/my/deals" label="내 거래 관리" />
                <QuickLink href="/notifications" label="알림 확인" />
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#5c4630',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
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
            color: '#24170f',
            fontSize: 18,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            color: '#6b5b4d',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>
      {children}
    </div>
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 52,
  borderRadius: 14,
  border: '1px solid #e6dac9',
  background: '#ffffff',
  padding: '0 16px',
  color: '#24170f',
  fontSize: 15,
  outline: 'none',
};

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#f5efe6',
  color: '#7a6a59',
};