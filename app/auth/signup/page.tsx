import Link from "next/link";
import { signupAction } from "./actions";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    ok?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error =
    typeof resolvedSearchParams.error === "string"
      ? resolvedSearchParams.error
      : "";
  const ok =
    typeof resolvedSearchParams.ok === "string"
      ? resolvedSearchParams.ok
      : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.2,
                color: "#2f2417",
                fontWeight: 800,
              }}
            >
              회원가입
            </h1>
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "#6b5b4b",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Msell 계정을 만들고 거래를 시작하세요.
            </p>
          </div>

          {ok ? (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 16,
                border: "1px solid #cdb38d",
                background: "#fffaf2",
                color: "#2f2417",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {ok}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 16,
                border: "1px solid #e6c2c2",
                background: "#fff7f7",
                color: "#7a2e2e",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          ) : null}

          <form
            action={signupAction}
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <label
                htmlFor="full_name"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                이름
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="이름을 입력하세요"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                성별
              </label>
              <select
                id="gender"
                name="gender"
                required
                defaultValue=""
                style={inputStyle}
              >
                <option value="" disabled>
                  성별을 선택하세요
                </option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phone_number"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                연락처
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                placeholder="연락처를 입력하세요"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="비밀번호를 입력하세요"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="password_confirm"
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                비밀번호 확인
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                placeholder="비밀번호를 다시 입력하세요"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 6,
                border: 0,
                borderRadius: 14,
                padding: "15px 16px",
                background: "#2f2417",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              회원가입
            </button>
          </form>

          <div
            style={{
              marginTop: 18,
              fontSize: 14,
              color: "#6b5b4b",
            }}
          >
            이미 계정이 있나요?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#2f2417",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 14,
  border: "1px solid #d9c9b3",
  background: "#fffdf9",
  padding: "0 14px",
  fontSize: 15,
  color: "#2f2417",
  outline: "none",
  boxSizing: "border-box",
};