import Link from "next/link";
import { loginAction } from "./actions";
import AuthGateway from "@/components/auth/AuthGateway";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

function pickParam(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved =
    searchParams && typeof (searchParams as Promise<Record<string, string | string[] | undefined>>).then === "function"
      ? await searchParams
      : (searchParams as Record<string, string | string[] | undefined> | undefined) ?? {};

  const next = pickParam(resolved?.next, "/account");
  const error = pickParam(resolved?.error, "");
  const message = pickParam(resolved?.message, "");

  return (
    <>
      <main
        style={{
          width: "100%",
          minHeight: "calc(100dvh - 180px)",
          padding: "clamp(24px, 6vw, 56px) 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <section
          className="msell-login-shell"
          style={{
            width: "100%",
            maxWidth: 420,
          }}
        >
          <div
            className="msell-login-card"
            style={{
              width: "100%",
              borderRadius: 28,
              border: "1px solid #e7d9c8",
              background:
                "linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%)",
              boxShadow: "0 24px 60px rgba(47, 36, 23, 0.08)",
              padding: "22px 22px 24px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#f1e6d6",
                color: "#9b7b58",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.14em",
              }}
            >
              MSELL
            </div>

            <h1
              style={{
                margin: "14px 0 18px",
                color: "#1f140c",
                fontSize: "clamp(38px, 5vw, 54px)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontWeight: 900,
              }}
            >
              로그인
            </h1>

            {error ? (
              <div
                style={{
                  marginBottom: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #efc7c7",
                  background: "#fff5f5",
                  color: "#8b2e2e",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            ) : null}

            {message ? (
              <div
                style={{
                  marginBottom: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #d9d2c3",
                  background: "#f8f3ea",
                  color: "#5b4631",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            ) : null}

            <form
              action={loginAction}
              style={{ display: "grid", gap: 12 }}
            >
              <input type="hidden" name="next" value={next} />

              <label
                htmlFor="email"
                style={{
                  display: "grid",
                  gap: 8,
                  color: "#8f7658",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                이메일
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 16,
                    border: "1px solid #e5ddd2",
                    background: "#ffffff",
                    padding: "0 16px",
                    color: "#2b1d12",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label
                htmlFor="password"
                style={{
                  display: "grid",
                  gap: 8,
                  color: "#8f7658",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                비밀번호
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 16,
                    border: "1px solid #e5ddd2",
                    background: "#ffffff",
                    padding: "0 16px",
                    color: "#2b1d12",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <button
                type="submit"
                style={{
                  width: "100%",
                  height: 54,
                  marginTop: 2,
                  border: "none",
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, #2f1d10 0%, #23140a 100%)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                이메일로 로그인
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "18px 0 16px",
                color: "#b29a7f",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#eadfce",
                }}
              />
              또는
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#eadfce",
                }}
              />
            </div>

            <AuthGateway next={next} />

            <div
              style={{
                marginTop: 16,
                textAlign: "center",
                color: "#8f7658",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              계정이 없으면{" "}
              <Link
                href={`/auth/signup?next=${encodeURIComponent(next)}`}
                style={{
                  color: "#2f1d10",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                회원가입
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .msell-login-shell {
          display: flex;
          justify-content: center;
        }

        @media (max-height: 860px) {
          main {
            align-items: flex-start !important;
          }

          .msell-login-shell {
            padding-top: 12px;
            padding-bottom: 12px;
          }
        }

        @media (max-width: 640px) {
          .msell-login-card {
            padding: 18px 16px 20px !important;
            border-radius: 22px !important;
          }
        }
      `}</style>
    </>
  );
}