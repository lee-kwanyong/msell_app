import Link from "next/link";
import AuthGateway from "@/components/auth/AuthGateway";
import { signupAction } from "@/app/auth/signup/actions";

type PageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function MobileSignupPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) ?? {};
  const next = resolved.next || "/account";
  const error = resolved.error || "";
  const message = resolved.message || "";

  return (
    <>
      <main className="msell-m-auth-page">
        <section className="msell-m-auth-shell">
          <div className="msell-m-auth-card">
            <div className="msell-m-auth-badge">MSELL</div>
            <h1 className="msell-m-auth-title">회원가입</h1>

            {error ? (
              <div className="msell-m-auth-alert msell-m-auth-alert-error">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="msell-m-auth-alert msell-m-auth-alert-message">
                {message}
              </div>
            ) : null}

            <form action={signupAction} className="msell-m-auth-form">
              <input type="hidden" name="next" value={next} />

              <label htmlFor="full_name" className="msell-m-auth-label">
                <span>이름</span>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="이름 입력"
                  className="msell-m-auth-input"
                />
              </label>

              <label htmlFor="phone_number" className="msell-m-auth-label">
                <span>연락처</span>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="01012345678"
                  className="msell-m-auth-input"
                />
              </label>

              <label htmlFor="email" className="msell-m-auth-label">
                <span>이메일</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="msell-m-auth-input"
                />
              </label>

              <label htmlFor="password" className="msell-m-auth-label">
                <span>비밀번호</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호 입력"
                  className="msell-m-auth-input"
                />
              </label>

              <label
                htmlFor="password_confirm"
                className="msell-m-auth-label"
              >
                <span>비밀번호 확인</span>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호 다시 입력"
                  className="msell-m-auth-input"
                />
              </label>

              <button type="submit" className="msell-m-auth-submit">
                이메일로 회원가입
              </button>
            </form>

            <div className="msell-m-auth-divider" aria-hidden="true">
              <span />
              <em>또는</em>
              <span />
            </div>

            <AuthGateway next={next} mode="signup" />

            <div className="msell-m-auth-bottom">
              이미 계정이 있으면{" "}
              <Link
                href={`/m/auth/login?next=${encodeURIComponent(next)}`}
                className="msell-m-auth-link"
              >
                로그인
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .msell-m-auth-page {
          width: 100%;
          min-height: calc(100dvh - 104px);
          padding: 12px 12px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          box-sizing: border-box;
          background: #f6f1e7;
        }

        .msell-m-auth-shell {
          width: 100%;
          max-width: 520px;
        }

        .msell-m-auth-card {
          width: 100%;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.08);
          padding: 18px 16px 20px;
          box-sizing: border-box;
        }

        .msell-m-auth-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f1e6d6;
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .msell-m-auth-title {
          margin: 12px 0 16px;
          color: #1f140c;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-m-auth-alert {
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-m-auth-alert-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .msell-m-auth-alert-message {
          border: 1px solid #d9d2c3;
          background: #f8f3ea;
          color: #5b4631;
        }

        .msell-m-auth-form {
          display: grid;
          gap: 12px;
        }

        .msell-m-auth-label {
          display: grid;
          gap: 8px;
        }

        .msell-m-auth-label span {
          color: #8f7658;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-m-auth-input {
          width: 100%;
          height: 52px;
          border-radius: 16px;
          border: 1px solid #e5ddd2;
          background: #ffffff;
          padding: 0 16px;
          color: #2b1d12;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .msell-m-auth-input::placeholder {
          color: #b4a089;
        }

        .msell-m-auth-input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
          transform: translateY(-1px);
        }

        .msell-m-auth-submit {
          width: 100%;
          height: 52px;
          margin-top: 2px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            filter 0.18s ease;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.18);
        }

        .msell-m-auth-submit:active {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(47, 29, 16, 0.16);
        }

        .msell-m-auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 14px;
        }

        .msell-m-auth-divider span {
          flex: 1;
          height: 1px;
          background: #eadfce;
        }

        .msell-m-auth-divider em {
          font-style: normal;
          color: #b29a7f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .msell-m-auth-bottom {
          margin-top: 16px;
          text-align: center;
          color: #8f7658;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-m-auth-link {
          color: #2f1d10;
          font-weight: 900;
          text-decoration: none;
        }

        .msell-m-auth-link:active {
          opacity: 0.8;
        }

        @media (max-width: 380px) {
          .msell-m-auth-card {
            padding: 16px 14px 18px;
          }

          .msell-m-auth-title {
            font-size: 28px;
          }

          .msell-m-auth-input,
          .msell-m-auth-submit {
            height: 50px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}