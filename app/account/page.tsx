import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { saveAccountAction } from "./actions";

function firstLetter(value?: string | null) {
  if (!value) return "U";
  return value.trim().charAt(0).toUpperCase();
}

function displayValue(value?: string | null, fallback = "-") {
  if (!value || !value.trim()) return fallback;
  return value;
}

function providerLabel(provider?: string | null) {
  if (!provider) return "Email";
  if (provider === "google") return "Google";
  if (provider === "kakao") return "Kakao";
  if (provider === "custom:naver") return "Naver";
  return provider;
}

function genderLabel(gender?: string | null) {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  if (gender === "other") return "기타";
  return "선택 안함";
}

export default async function AccountPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username, phone_number, gender, role")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    "";

  const username =
    profile?.username ||
    (user.user_metadata?.username as string | undefined) ||
    "";

  const phoneNumber =
    profile?.phone_number ||
    (user.user_metadata?.phone_number as string | undefined) ||
    "";

  const gender =
    profile?.gender ||
    (user.user_metadata?.gender as string | undefined) ||
    "";

  const role =
    profile?.role ||
    (user.user_metadata?.role as string | undefined) ||
    "user";

  const email = user.email || "";
  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : "email";

  const displayName = fullName || username || "사용자";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, #2b1d12 0%, #4b2f1a 52%, #7a532d 100%)",
            borderRadius: 32,
            padding: 28,
            color: "#fffaf2",
            boxShadow: "0 22px 60px rgba(56, 36, 19, 0.18)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              opacity: 0.78,
              marginBottom: 18,
            }}
          >
            ACCOUNT
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "92px minmax(0, 1fr)",
              gap: 22,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: 34,
                fontWeight: 900,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              {firstLetter(displayName)}
            </div>

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 44,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                계정
              </h1>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}
              >
                {displayValue(displayName)}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {providerLabel(provider)}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {role}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  활성
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 32,
            padding: 24,
            boxShadow: "0 18px 44px rgba(61, 41, 22, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#2f2417",
                }}
              >
                계정 정보
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "#7b6751",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                이름, 아이디, 연락처, 성별, 이메일, 로그인 방식, 권한과 바로가기를 한
                화면에서 관리합니다.
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                background: "#f2e8db",
                color: "#5a4227",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              profiles 반영
            </div>
          </div>

          <form action={saveAccountAction}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              <label
                style={{
                  display: "block",
                  borderRadius: 22,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  이름
                </div>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={fullName}
                  placeholder="이름 입력"
                  style={{
                    width: "100%",
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    color: "#24190f",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  borderRadius: 22,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  아이디
                </div>
                <input
                  type="text"
                  name="username"
                  defaultValue={username}
                  placeholder="아이디 입력"
                  style={{
                    width: "100%",
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    color: "#24190f",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  borderRadius: 22,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  연락처
                </div>
                <input
                  type="text"
                  name="phone_number"
                  defaultValue={phoneNumber}
                  placeholder="연락처 입력"
                  style={{
                    width: "100%",
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    color: "#24190f",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  borderRadius: 22,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  성별
                </div>
                <select
                  name="gender"
                  defaultValue={gender}
                  style={{
                    width: "100%",
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    color: "#24190f",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  <option value="">선택 안함</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </label>

              <div
                style={{
                  borderRadius: 22,
                  background: "#f5ede2",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  이메일
                </div>
                <div
                  style={{
                    color: "#5e4b38",
                    fontSize: 18,
                    fontWeight: 800,
                    wordBreak: "break-word",
                  }}
                >
                  {displayValue(email)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  background: "#f5ede2",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  로그인 방식
                </div>
                <div
                  style={{
                    color: "#5e4b38",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {providerLabel(provider)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  background: "#f5ede2",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  계정 권한
                </div>
                <div
                  style={{
                    color: "#5e4b38",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {role}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  background: "#f5ede2",
                  border: "1px solid #eadfcf",
                  padding: "16px 16px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#8a7156",
                    marginBottom: 8,
                  }}
                >
                  현재 성별 표시
                </div>
                <div
                  style={{
                    color: "#5e4b38",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {genderLabel(gender)}
                </div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  borderRadius: 24,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#2f2417",
                    marginBottom: 14,
                  }}
                >
                  바로가기
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <Link
                    href="/my/listings"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 56,
                      borderRadius: 18,
                      background: "#fffaf4",
                      border: "1px solid #eadfcf",
                      color: "#2f2417",
                      fontSize: 15,
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    내 매물
                  </Link>

                  <Link
                    href="/my/deals"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 56,
                      borderRadius: 18,
                      background: "#fffaf4",
                      border: "1px solid #eadfcf",
                      color: "#2f2417",
                      fontSize: 15,
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    내 거래
                  </Link>

                  <Link
                    href="/listings/create"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 56,
                      borderRadius: 18,
                      background: "#fffaf4",
                      border: "1px solid #eadfcf",
                      color: "#2f2417",
                      fontSize: 15,
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    자산 등록
                  </Link>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="submit"
                style={{
                  minWidth: 200,
                  height: 58,
                  border: 0,
                  borderRadius: 18,
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(47, 36, 23, 0.22)",
                }}
              >
                저장하기
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}