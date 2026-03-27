import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updateAccountAction } from "./actions";

type ProfileRow = {
  full_name?: string | null;
  username?: string | null;
  phone_number?: string | null;
  email?: string | null;
};

type SearchParams = {
  success?: string;
  error?: string;
};

function getMessage(searchParams?: SearchParams) {
  if (searchParams?.success === "1") {
    return {
      type: "success" as const,
      text: "계정 정보가 저장되었습니다.",
    };
  }

  switch (searchParams?.error) {
    case "missing_phone":
      return {
        type: "error" as const,
        text: "연락처를 입력해 주세요.",
      };
    case "update_failed":
      return {
        type: "error" as const,
        text: "저장에 실패했습니다.",
      };
    default:
      return null;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const query = (await searchParams) || {};
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, username, phone_number, email")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileData || {}) as ProfileRow;
  const message = getMessage(query);

  const emailValue =
    profile.email ||
    user.email ||
    "";

  const fullNameValue = profile.full_name || "";
  const usernameValue = profile.username || "";
  const phoneValue = profile.phone_number || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "20px 16px 56px",
        }}
      >
        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid #e6dac8",
            borderRadius: 24,
            padding: 16,
            boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
            backdropFilter: "blur(10px)",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#8a7357",
                  marginBottom: 4,
                }}
              >
                ACCOUNT
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.08,
                  color: "#241b11",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                계정 설정
              </h1>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 42,
                padding: "0 14px",
                borderRadius: 14,
                background: "#fff",
                border: "1px solid #eadfcf",
                color: "#6e5a43",
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {emailValue || "이메일 없음"}
            </div>
          </div>
        </section>

        {message ? (
          <section
            style={{
              background: message.type === "success" ? "#f7fbf6" : "#fff5f2",
              border:
                message.type === "success"
                  ? "1px solid #cfe3c8"
                  : "1px solid #f0c7b6",
              color: message.type === "success" ? "#2f5d2a" : "#9a3412",
              borderRadius: 18,
              padding: "14px 16px",
              marginBottom: 14,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {message.text}
          </section>
        ) : null}

        <div
          className="msell-account-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: 14,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
            }}
          >
            <form action={updateAccountAction} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="full_name"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#241b11",
                  }}
                >
                  이름
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  defaultValue={fullNameValue}
                  placeholder="이름"
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: "1px solid #d7c6ae",
                    background: "#fffdf9",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#241b11",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="username"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#241b11",
                  }}
                >
                  아이디
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={usernameValue}
                  placeholder="아이디"
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: "1px solid #d7c6ae",
                    background: "#fffdf9",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#241b11",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="phone_number"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#241b11",
                  }}
                >
                  연락처
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  defaultValue={phoneValue}
                  placeholder="연락처"
                  required
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: "1px solid #d7c6ae",
                    background: "#fffdf9",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#241b11",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="email"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#241b11",
                  }}
                >
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={emailValue}
                  readOnly
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: "1px solid #e6dac8",
                    background: "#f8f4ed",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#6e5a43",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 160,
                    height: 50,
                    padding: "0 18px",
                    border: 0,
                    borderRadius: 16,
                    background: "#2f2417",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 14px 24px rgba(47,36,23,0.14)",
                  }}
                >
                  저장하기
                </button>
              </div>
            </form>
          </section>

          <aside
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <section
              style={{
                background: "#fff",
                border: "1px solid #eadfcf",
                borderRadius: 24,
                padding: 20,
                boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#8a7357",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                ACCOUNT INFO
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8a7357",
                      fontWeight: 700,
                    }}
                  >
                    이메일
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#241b11",
                      fontWeight: 800,
                      wordBreak: "break-all",
                    }}
                  >
                    {emailValue || "-"}
                  </span>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#f0e5d6",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8a7357",
                      fontWeight: 700,
                    }}
                  >
                    이름
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#241b11",
                      fontWeight: 800,
                    }}
                  >
                    {fullNameValue || "-"}
                  </span>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#f0e5d6",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8a7357",
                      fontWeight: 700,
                    }}
                  >
                    아이디
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#241b11",
                      fontWeight: 800,
                    }}
                  >
                    {usernameValue || "-"}
                  </span>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#f0e5d6",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8a7357",
                      fontWeight: 700,
                    }}
                  >
                    연락처
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#241b11",
                      fontWeight: 800,
                    }}
                  >
                    {phoneValue || "-"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <style>{`
          @media (max-width: 920px) {
            .msell-account-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}