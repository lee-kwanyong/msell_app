import Link from 'next/link';
import AuthGateway from '@/components/auth/AuthGateway';
import { loginAction } from './actions';

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = resolvedSearchParams.error ?? '';
  const success = resolvedSearchParams.success ?? '';
  const next = resolvedSearchParams.next ?? '/';

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
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: 20 }}>
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
            로그인
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 15,
              lineHeight: 1.6,
              color: '#6b5b4d',
            }}
          >
            이메일 로그인 또는 소셜 로그인으로 Msell에 접속할 수 있다.
          </p>
        </div>

        {success ? (
          <div style={successStyle}>{success}</div>
        ) : null}

        {error ? (
          <div style={errorStyle}>{error}</div>
        ) : null}

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#7b6a58',
                marginBottom: 6,
              }}
            >
              AUTH
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#241b11',
                letterSpacing: '-0.02em',
              }}
            >
              계정으로 계속하기
            </div>
          </div>

          <div
            style={{
              padding: 28,
              display: 'grid',
              gap: 18,
            }}
          >
            <AuthGateway mode="login" next={next} />

            <div style={dividerStyle}>
              <div style={dividerLineStyle} />
              <span>또는 이메일 로그인</span>
              <div style={dividerLineStyle} />
            </div>

            <form
              action={loginAction}
              style={{
                display: 'grid',
                gap: 14,
              }}
            >
              <input type="hidden" name="next" value={next} />

              <Field label="이메일" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="비밀번호" htmlFor="password">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  required
                  style={inputStyle}
                />
              </Field>

              <button type="submit" style={primaryButtonStyle}>
                이메일로 로그인
              </button>
            </form>
          </div>

          <div style={footerStyle}>
            <span
              style={{
                fontSize: 14,
                color: '#6f5f4f',
              }}
            >
              아직 계정이 없다면
            </span>

            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              style={secondaryButtonStyle}
            >
              회원가입
            </Link>
          </div>
        </div>
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
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#3a2d1d',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e7dccb',
  borderRadius: 28,
  boxShadow: '0 20px 50px rgba(47, 36, 23, 0.06)',
  overflow: 'hidden',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: 28,
  borderBottom: '1px solid #efe5d6',
  background:
    'linear-gradient(180deg, rgba(246,241,231,0.9) 0%, rgba(255,255,255,1) 100%)',
};

const successStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 16,
  background: '#f4efe6',
  border: '1px solid #dbcdb8',
  color: '#2f2417',
  fontSize: 14,
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 16,
  background: '#fff4f2',
  border: '1px solid #efc2ba',
  color: '#9a3d2f',
  fontSize: 14,
  fontWeight: 600,
};

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  color: '#8b7966',
  fontSize: 13,
  fontWeight: 700,
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#eee3d4',
};

const footerStyle: React.CSSProperties = {
  padding: 28,
  borderTop: '1px solid #efe5d6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  background: '#fffdf9',
};

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
  height: 52,
  borderRadius: 14,
  border: 'none',
  background: '#2f2417',
  color: '#fff',
  padding: '0 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 44,
  borderRadius: 14,
  border: '1px solid #ddcfbb',
  background: '#eadfcf',
  color: '#2f2417',
  padding: '0 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};