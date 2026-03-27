import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { updateAccountAction } from './actions';

type AccountPageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const success = resolvedSearchParams.success ?? '';
  const error = resolvedSearchParams.error ?? '';

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, phone_number, avatar_url, email')
    .eq('id', user.id)
    .maybeSingle();

  const email = profile?.email || user.email || '';
  const fullName =
    profile?.full_name ||
    String(user.user_metadata?.full_name ?? '').trim() ||
    '';
  const username =
    profile?.username ||
    String(user.user_metadata?.username ?? '').trim() ||
    '';
  const phoneNumber =
    profile?.phone_number ||
    String(user.user_metadata?.phone_number ?? '').trim() ||
    '';
  const avatarUrl =
    profile?.avatar_url ||
    String(user.user_metadata?.avatar_url ?? '').trim() ||
    '';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f1e7',
        padding: '40px 20px 80px',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.2,
              fontWeight: 800,
              color: '#241b11',
              letterSpacing: '-0.02em',
            }}
          >
            내 계정
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 15,
              lineHeight: 1.6,
              color: '#6b5b4d',
            }}
          >
            기본 정보와 연락처를 정리하는 화면이다.
          </p>
        </div>

        {success ? (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 16px',
              borderRadius: 16,
              background: '#f4efe6',
              border: '1px solid #dbcdb8',
              color: '#2f2417',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: '14px 16px',
              borderRadius: 16,
              background: '#fff4f2',
              border: '1px solid #efc2ba',
              color: '#9a3d2f',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : null}

        <form
          action={updateAccountAction}
          style={{
            background: '#ffffff',
            border: '1px solid #e7dccb',
            borderRadius: 28,
            boxShadow: '0 20px 50px rgba(47, 36, 23, 0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 28,
              borderBottom: '1px solid #efe5d6',
              background:
                'linear-gradient(180deg, rgba(246,241,231,0.9) 0%, rgba(255,255,255,1) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#7b6a58',
                    marginBottom: 6,
                  }}
                >
                  PROFILE
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#241b11',
                    letterSpacing: '-0.02em',
                  }}
                >
                  계정 정보 관리
                </div>
              </div>

              <div
                style={{
                  minWidth: 220,
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: '#fff',
                  border: '1px solid #eadfcf',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#8a7863',
                    marginBottom: 6,
                  }}
                >
                  로그인 이메일
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#2f2417',
                    wordBreak: 'break-all',
                  }}
                >
                  {email || '-'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 28,
              display: 'grid',
              gap: 18,
            }}
          >
            <Field label="이름" htmlFor="full_name" required>
              <input
                id="full_name"
                name="full_name"
                defaultValue={fullName}
                placeholder="이름을 입력하세요"
                style={inputStyle}
                required
              />
            </Field>

            <Field label="아이디" htmlFor="username" required>
              <input
                id="username"
                name="username"
                defaultValue={username}
                placeholder="아이디를 입력하세요"
                style={inputStyle}
                required
              />
            </Field>

            <Field label="연락처" htmlFor="phone_number">
              <input
                id="phone_number"
                name="phone_number"
                defaultValue={phoneNumber}
                placeholder="연락처를 입력하세요"
                style={inputStyle}
              />
            </Field>

            <Field label="프로필 이미지 URL" htmlFor="avatar_url">
              <input
                id="avatar_url"
                name="avatar_url"
                defaultValue={avatarUrl}
                placeholder="https://..."
                style={inputStyle}
              />
            </Field>
          </div>

          <div
            style={{
              padding: 28,
              borderTop: '1px solid #efe5d6',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fffdf9',
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: '#7e6d5d',
                lineHeight: 1.5,
              }}
            >
              저장하면 프로필 정보와 소셜 로그인 이후 표시값을 함께 정리한다.
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Link href="/" style={secondaryButtonStyle}>
                홈으로
              </Link>
              <button type="submit" style={primaryButtonStyle}>
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
  required = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'grid',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#3a2d1d',
        }}
      >
        {label}
        {required ? (
          <span
            style={{
              marginLeft: 6,
              color: '#a06b2b',
            }}
          >
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 54,
  borderRadius: 16,
  border: '1px solid #ddcfbb',
  background: '#fff',
  padding: '0 16px',
  fontSize: 15,
  color: '#241b11',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: 'none',
  background: '#2f2417',
  color: '#fff',
  padding: '0 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: '1px solid #ddcfbb',
  background: '#eadfcf',
  color: '#2f2417',
  padding: '0 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};