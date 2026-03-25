import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updateAccountAction } from "./actions";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_banned?: boolean | null;
};

type SearchParams = {
  success?: string;
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function roleLabel(role: string | null) {
  switch (role) {
    case "admin":
      return "관리자";
    case "user":
      return "사용자";
    default:
      return role || "사용자";
  }
}

function statusLabel(profile: ProfileRow | null) {
  if (!profile) return "정상";
  if (profile.is_banned) return "제한";
  return "정상";
}

function successMessage(code?: string) {
  switch (code) {
    case "profile_updated":
      return "계정 정보가 정상적으로 저장되었습니다.";
    default:
      return "";
  }
}

function errorMessage(code?: string) {
  switch (code) {
    case "unauthorized":
      return "로그인 후 접근할 수 있습니다.";
    case "update_failed":
      return "계정 정보 저장에 실패했습니다. 다시 시도해주세요.";
    default:
      return "";
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolvedSearchParams =
    typeof (searchParams as Promise<SearchParams>)?.then === "function"
      ? await (searchParams as Promise<SearchParams>)
      : ((searchParams as SearchParams | undefined) ?? {});

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("id,email,full_name,username,phone_number,role,created_at,updated_at,is_banned")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRaw as ProfileRow | null) ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: null,
    username: null,
    phone_number: null,
    role: "user",
    created_at: user.created_at ?? null,
    updated_at: null,
    is_banned: false,
  };

  const joinedAt = formatDate(profile.created_at ?? user.created_at ?? null);
  const updatedAt = formatDate(profile.updated_at ?? null);
  const role = roleLabel(profile.role);
  const accountStatus = statusLabel(profile);
  const success = successMessage(resolvedSearchParams.success);
  const error = errorMessage(resolvedSearchParams.error);

  return (
    <>
      <style>{`
        .account-page {
          display: grid;
          gap: 18px;
        }

        .account-shell {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .account-hero {
          background: linear-gradient(180deg, #f8f3ea 0%, #f3ecdf 100%);
          border: 1px solid #eadfcf;
          border-radius: 28px;
          padding: 28px;
          display: grid;
          gap: 18px;
        }

        .account-hero-card {
          background: #fffaf2;
          border: 1px solid #eadfcf;
          border-radius: 24px;
          padding: 24px;
        }

        .account-hero-summary {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .summary-pill {
          border-radius: 20px;
          padding: 16px 18px;
          background: linear-gradient(135deg, #2f2417 0%, #4b2d11 100%);
          color: #fff;
        }

        .content-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.78fr);
        }

        .panel-card {
          background: #fff;
          border: 1px solid #eadfcf;
          border-radius: 28px;
          padding: 24px;
        }

        .form-grid {
          display: grid;
          gap: 18px;
        }

        .field-grid-2 {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .field-label {
          display: block;
          margin-bottom: 9px;
          font-size: 14px;
          font-weight: 800;
          color: #1f160e;
        }

        .field-input {
          width: 100%;
          height: 58px;
          border: 1px solid #d9c7b1;
          background: #fff;
          color: #1f160e;
          border-radius: 18px;
          padding: 0 18px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
        }

        .field-input:focus {
          border-color: #7b6240;
          box-shadow: 0 0 0 3px rgba(123, 98, 64, 0.08);
        }

        .helper-box {
          border: 1px solid #efe5d8;
          background: #fffdfa;
          border-radius: 20px;
          padding: 16px;
        }

        .meta-list {
          display: grid;
          gap: 12px;
        }

        .meta-item {
          border: 1px solid #efe5d8;
          background: #fffdfa;
          border-radius: 18px;
          padding: 14px 16px;
        }

        .action-row {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          padding-top: 4px;
        }

        .action-left,
        .action-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-dark,
        .btn-light,
        .btn-ghost {
          height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          border: none;
        }

        .btn-dark {
          background: #2f2417;
          color: #fff;
        }

        .btn-light {
          background: #eadfcf;
          color: #2f2417;
        }

        .btn-ghost {
          background: #fff;
          color: #2f2417;
          border: 1px solid #d9c7b1;
        }

        .success-box {
          border: 1px solid #b7ebc6;
          background: #ecfdf3;
          color: #0f8b4c;
          border-radius: 18px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
        }

        .error-box {
          border: 1px solid #f3c7c7;
          background: #fff4f4;
          color: #a33434;
          border-radius: 18px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 980px) {
          .account-hero-summary,
          .content-grid,
          .field-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .account-shell {
            gap: 14px;
          }

          .account-hero,
          .panel-card {
            padding: 16px;
            border-radius: 20px;
          }

          .account-hero-card {
            padding: 16px;
            border-radius: 18px;
          }

          .account-title {
            font-size: 28px !important;
            line-height: 1.22 !important;
          }

          .account-copy {
            font-size: 14px !important;
            line-height: 1.65 !important;
          }

          .action-row {
            flex-direction: column;
            align-items: stretch;
          }

          .action-left,
          .action-right {
            width: 100%;
          }

          .action-left > *,
          .action-right > * {
            width: 100%;
          }

          .btn-dark,
          .btn-light,
          .btn-ghost {
            width: 100%;
          }
        }
      `}</style>

      <div className="account-page">
        <div className="account-shell">
          <section className="account-hero">
            <div className="account-hero-card">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#8d7b67",
                  marginBottom: 12,
                }}
              >
                ACCOUNT SETTINGS
              </div>

              <h1
                className="account-title"
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.2,
                  color: "#20170f",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                계정 정보를 정리하고
                <br />
                거래에 필요한 기본 정보를 관리하세요
              </h1>

              <p
                className="account-copy"
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#6c5a48",
                }}
              >
                이름, 사용자명, 연락처를 최신 상태로 유지하면 거래 흐름을 더 안정적으로 관리할 수 있습니다.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 22,
                }}
              >
                <Link
                  href="/"
                  className="btn-dark"
                  style={{ textDecoration: "none" }}
                >
                  홈으로
                </Link>

                <Link
                  href="/my/deals"
                  className="btn-light"
                  style={{ textDecoration: "none" }}
                >
                  내 거래 보기
                </Link>
              </div>
            </div>

            <div className="account-hero-summary">
              <div className="summary-pill">
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: 0.8,
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  ROLE
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    lineHeight: 1.2,
                  }}
                >
                  {role}
                </div>
              </div>

              <div className="summary-pill">
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: 0.8,
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  STATUS
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    lineHeight: 1.2,
                  }}
                >
                  {accountStatus}
                </div>
              </div>

              <div className="summary-pill">
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: 0.8,
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  EMAIL
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  {profile.email || user.email || "-"}
                </div>
              </div>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel-card">
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#1f160e",
                  marginBottom: 8,
                }}
              >
                기본 정보 수정
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#7b6a58",
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                거래와 운영에 필요한 프로필 정보를 간단히 업데이트할 수 있습니다.
              </div>

              {success ? <div className="success-box">{success}</div> : null}
              {error ? (
                <div style={{ marginTop: success ? 12 : 0 }} className="error-box">
                  {error}
                </div>
              ) : null}

              <form
                action={updateAccountAction}
                className="form-grid"
                style={{ marginTop: success || error ? 16 : 0 }}
              >
                <div className="field-grid-2">
                  <div>
                    <label htmlFor="full_name" className="field-label">
                      이름
                    </label>
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      defaultValue={profile.full_name ?? ""}
                      placeholder="이름 입력"
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="field-label">
                      사용자명
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      defaultValue={profile.username ?? ""}
                      placeholder="username"
                      className="field-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone_number" className="field-label">
                    연락처
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="text"
                    defaultValue={profile.phone_number ?? ""}
                    placeholder="010-0000-0000"
                    className="field-input"
                  />
                </div>

                <div className="helper-box">
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: "#2f2417",
                      marginBottom: 8,
                    }}
                  >
                    안내
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#7b6a58",
                      lineHeight: 1.7,
                    }}
                  >
                    거래 상대와의 소통이나 운영 확인에 필요한 정보만 정확하게 유지하는 것이 좋습니다.
                    민감한 세부 정보는 공지 및 거래 흐름에 맞게 신중하게 관리하세요.
                  </div>
                </div>

                <div className="action-row">
                  <div className="action-left">
                    <Link href="/" className="btn-ghost">
                      홈으로
                    </Link>
                  </div>

                  <div className="action-right">
                    <button type="submit" className="btn-dark">
                      정보 저장
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="panel-card">
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#1f160e",
                  marginBottom: 8,
                }}
              >
                계정 요약
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#7b6a58",
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                현재 계정 상태와 가입 정보를 한눈에 확인할 수 있습니다.
              </div>

              <div className="meta-list">
                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    권한
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#1f160e",
                      fontWeight: 900,
                    }}
                  >
                    {role}
                  </div>
                </div>

                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    계정 상태
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#1f160e",
                      fontWeight: 900,
                    }}
                  >
                    {accountStatus}
                  </div>
                </div>

                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    가입 이메일
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#1f160e",
                      fontWeight: 900,
                      wordBreak: "break-word",
                    }}
                  >
                    {profile.email || user.email || "-"}
                  </div>
                </div>

                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    가입일
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#1f160e",
                      fontWeight: 900,
                    }}
                  >
                    {joinedAt}
                  </div>
                </div>

                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    최근 수정
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#1f160e",
                      fontWeight: 900,
                    }}
                  >
                    {updatedAt}
                  </div>
                </div>

                <div className="meta-item">
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8d7b67",
                      fontWeight: 800,
                      marginBottom: 10,
                    }}
                  >
                    빠른 이동
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href="/my/listings"
                      className="btn-light"
                      style={{
                        height: 38,
                        padding: "0 14px",
                        fontSize: 12,
                        textDecoration: "none",
                      }}
                    >
                      내 등록물
                    </Link>
                    <Link
                      href="/my/deals"
                      className="btn-ghost"
                      style={{
                        height: 38,
                        padding: "0 14px",
                        fontSize: 12,
                        textDecoration: "none",
                      }}
                    >
                      내 거래
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}