import Link from "next/link";
import { signupAction } from "./actions";

type SearchParams = Promise<{
  error?: string;
  success?: string;
  next?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
}>;

function decodeValue(value?: string) {
  return value ? decodeURIComponent(value) : "";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const error = decodeValue(params?.error);
  const success = decodeValue(params?.success);
  const next = decodeValue(params?.next) || "/";
  const full_name = decodeValue(params?.full_name);
  const phone_number = decodeValue(params?.phone_number);
  const email = decodeValue(params?.email);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "40px 20px 96px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#fbf7f1",
          border: "1px solid #eadfce",
          borderRadius: 32,
          padding: 24,
          boxShadow: "0 20px 44px rgba(61, 41, 22, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#a58a6d",
            marginBottom: 10,
          }}
        >
          MSELL
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 52,
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            color: "#16110d",
            fontWeight: 900,
          }}
        >
          회원가입
        </h1>

        {error ? (
          <div
            style={{
              marginTop: 18,
              borderRadius: 18,
              border: "1px solid #efc0c0",
              background: "#fff4f4",
              color: "#b42318",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginTop: 18,
              borderRadius: 18,
              border: "1px solid #cfe3c7",
              background: "#f5fbf2",
              color: "#2f6b2f",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {success}
          </div>
        ) : null}

        <form action={signupAction} style={{ marginTop: 18 }}>
          <input type="hidden" name="next" value={next} />

          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "block" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#7f684f",
                }}
              >
                이름
              </div>
              <input
                type="text"
                name="full_name"
                defaultValue={full_name}
                placeholder="이름 입력"
                required
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "0 16px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#7f684f",
                }}
              >
                연락처
              </div>
              <input
                type="text"
                name="phone_number"
                defaultValue={phone_number}
                placeholder="연락처 입력"
                required
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "0 16px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#7f684f",
                }}
              >
                이메일
              </div>
              <input
                type="email"
                name="email"
                defaultValue={email}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "0 16px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#7f684f",
                }}
              >
                비밀번호
              </div>
              <input
                type="password"
                name="password"
                placeholder="비밀번호 입력"
                required
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "0 16px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#7f684f",
                }}
              >
                비밀번호 확인
              </div>
              <input
                type="password"
                name="password_confirm"
                placeholder="비밀번호 다시 입력"
                required
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "0 16px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              height: 56,
              borderRadius: 18,
              border: 0,
              marginTop: 14,
              background: "#2f2417",
              color: "#fffaf2",
              fontSize: 15,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(47, 36, 23, 0.2)",
            }}
          >
            이메일로 회원가입
          </button>
        </form>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            color: "#8a7156",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          이미 계정이 있으면{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            style={{
              color: "#2f2417",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}