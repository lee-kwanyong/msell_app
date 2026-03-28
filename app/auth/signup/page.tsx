import Link from "next/link";
import AuthGateway from "@/components/auth/AuthGateway";
import { signupAction } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) ?? {};
  const next = resolved.next || "/account";
  const error = resolved.error || "";
  const message = resolved.message || "";

  return (
    <>
      <main className="msell-signup-page">
        <section className="msell-signup-shell">
          <div className="msell-signup-card">
            <div className="msell-signup-badge">MSELL</div>

            <h1 className="msell-signup-title">회원가입</h1>

            {error ? (
              <div className="msell-signup-alert msell-signup-alert-error">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="msell-signup-alert msell-signup-alert-message">
                {message}
              </div>
            ) : null}

            <form action={signupAction} className="msell-signup-form">
              <input type="hidden" name="next" value={next} />

              <label htmlFor="full_name" className="msell-signup-label">
                <span>이름</span>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="이름 입력"
                  className="msell-signup-input"
                />
              </label>

              <label htmlFor="phone_number" className="msell-signup-label">
                <span>연락처</span>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="01012345678"
                  className="msell-signup-input"
                  inputMode="tel"
                />
              </label>

              <label htmlFor="email" className="msell-signup-label">
                <span>이메일</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="msell-signup-input"
                />
              </label>

              <label htmlFor="password" className="msell-signup-label">
                <span>비밀번호</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호 입력"
                  className="msell-signup-input"
                />
              </label>

              <label
                htmlFor="password_confirm"
                className="msell-signup-label"
              >
                <span>비밀번호 확인</span>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호 다시 입력"
                  className="msell-signup-input"
                />
              </label>

              <button type="submit" className="msell-signup-submit">
                이메일로 회원가입
              </button>
            </form>

            <div className="msell-signup-divider" aria-hidden="true">
              <span />
              <em>또는</em>
              <span />
            </div>

            <AuthGateway next={next} mode="signup" />

            <div className="msell-signup-login">
              이미 계정이 있으면{" "}
              <Link
                href={`/auth/login?next=${encodeURIComponent(next)}`}
                className="msell-signup-login-link"
              >
                로그인
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .msell-signup-page {
          width: 100%;
          min-height: calc(100dvh - 180px);
          padding: clamp(20px, 4vw, 56px) 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
        }

        .msell-signup-shell {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: center;
        }

        .msell-signup-card {
          width: 100%;
          border-radius: 28px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 24px 60px rgba(47, 36, 23, 0.08);
          padding: 24px;
          box-sizing: border-box;
        }

        .msell-signup-badge {
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

        .msell-signup-title {
          margin: 14px 0 18px;
          color: #1f140c;
          font-size: clamp(34px, 5vw, 50px);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-signup-alert {
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-signup-alert-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .msell-signup-alert-message {
          border: 1px solid #d9d2c3;
          background: #f8f3ea;
          color: #5b4631;
        }

        .msell-signup-form {
          display: grid;
          gap: 12px;
        }

        .msell-signup-label {
          display: grid;
          gap: 8px;
        }

        .msell-signup-label span {
          color: #8f7658;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-signup-input {
          width: 100%;
          height: 54px;
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

        .msell-signup-input::placeholder {
          color: #b4a089;
        }

        .msell-signup-input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
          transform: translateY(-1px);
        }

        .msell-signup-submit {
          width: 100%;
          height: 54px;
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
            filter 0.18s ease,
            opacity 0.18s ease;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.18);
        }

        .msell-signup-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(47, 29, 16, 0.22);
          filter: brightness(1.02);
        }

        .msell-signup-submit:active {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(47, 29, 16, 0.16);
        }

        .msell-signup-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 18px 0 16px;
        }

        .msell-signup-divider span {
          flex: 1;
          height: 1px;
          background: #eadfce;
        }

        .msell-signup-divider em {
          font-style: normal;
          color: #b29a7f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .msell-signup-login {
          margin-top: 16px;
          text-align: center;
          color: #8f7658;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-signup-login-link {
          color: #2f1d10;
          font-weight: 900;
          text-decoration: none;
        }

        .msell-signup-login-link:hover {
          text-decoration: underline;
        }

        @media (max-height: 900px) {
          .msell-signup-page {
            align-items: flex-start;
            padding-top: 20px;
            padding-bottom: 20px;
          }
        }

        @media (max-width: 640px) {
          .msell-signup-page {
            min-height: calc(100dvh - 132px);
            padding: 14px 12px 20px;
            align-items: flex-start;
          }

          .msell-signup-shell {
            max-width: 100%;
          }

          .msell-signup-card {
            border-radius: 22px;
            padding: 18px 16px 20px;
            box-shadow: 0 16px 34px rgba(47, 36, 23, 0.08);
          }

          .msell-signup-title {
            margin: 12px 0 16px;
            font-size: 30px;
          }

          .msell-signup-input,
          .msell-signup-submit {
            height: 52px;
          }

          .msell-signup-divider {
            margin: 16px 0 14px;
          }
        }

        @media (max-width: 380px) {
          .msell-signup-card {
            padding: 16px 14px 18px;
          }

          .msell-signup-title {
            font-size: 28px;
          }

          .msell-signup-input,
          .msell-signup-submit {
            height: 50px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}