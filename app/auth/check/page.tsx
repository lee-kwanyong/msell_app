import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type AuthCheckPageProps = {
  searchParams?: Promise<{
    error?: string;
    ok?: string;
    next?: string;
  }>;
};

export default async function AuthCheckPage({
  searchParams,
}: AuthCheckPageProps) {
  const supabase = await supabaseServer();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const error = resolvedSearchParams?.error;
  const ok = resolvedSearchParams?.ok;
  const next = resolvedSearchParams?.next || "/";

  const isLoggedIn = !!user;

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
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.2,
              color: "#2f2417",
              fontWeight: 800,
            }}
          >
            인증 상태 확인
          </h1>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: "#6b5b4b",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            현재 로그인 세션과 인증 결과를 확인하는 페이지입니다.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gap: 14,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                border: "1px solid #eadfcf",
                background: "#fcfaf6",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#8b7a67",
                  marginBottom: 6,
                }}
              >
                세션 상태
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#2f2417",
                  fontWeight: 700,
                }}
              >
                {isLoggedIn ? "로그인됨" : "로그인되지 않음"}
              </div>
              {user?.email ? (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: "#5f5142",
                  }}
                >
                  {user.email}
                </div>
              ) : null}
            </div>

            {ok ? (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  border: "1px solid #cdb38d",
                  background: "#fffaf2",
                  color: "#2f2417",
                }}
              >
                <strong>성공:</strong> {ok}
              </div>
            ) : null}

            {error ? (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  border: "1px solid #e6c2c2",
                  background: "#fff7f7",
                  color: "#7a2e2e",
                }}
              >
                <strong>오류:</strong> {error}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 24,
            }}
          >
            <Link
              href={next}
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#2f2417",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              계속 진행
            </Link>

            <Link
              href="/auth/login"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#eadfcf",
                color: "#2f2417",
                fontWeight: 700,
              }}
            >
              로그인으로 이동
            </Link>

            <Link
              href="/"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#f3ede3",
                color: "#2f2417",
                fontWeight: 700,
              }}
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}