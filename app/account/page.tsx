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
};

function getProviderLabel(appMetadata: Record<string, unknown> | undefined) {
  const providers = Array.isArray(appMetadata?.providers)
    ? (appMetadata?.providers as string[])
    : [];

  if (providers.includes("naver")) return "네이버";
  if (providers.includes("kakao")) return "카카오";
  if (providers.includes("google")) return "구글";
  if (providers.includes("email")) return "이메일";
  return "기타";
}

function getInitial(name: string | null, email: string | null) {
  const base = (name || email || "M").trim();
  return base.slice(0, 1).toUpperCase();
}

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AccountPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) ?? {};
  const error = resolved.error || "";
  const message = resolved.message || "";

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, phone_number")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRaw as ProfileRow | null) ?? null;

  const email = profile?.email || user.email || "";
  const fullName =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "") ||
    "";
  const username =
    profile?.username ||
    (typeof user.user_metadata?.user_name === "string"
      ? user.user_metadata.user_name
      : typeof user.user_metadata?.preferred_username === "string"
      ? user.user_metadata.preferred_username
      : "") ||
    "";
  const phoneNumber =
    profile?.phone_number ||
    (typeof user.user_metadata?.phone_number === "string"
      ? user.user_metadata.phone_number
      : typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : "") ||
    "";

  const providerLabel = getProviderLabel(user.app_metadata);
  const initial = getInitial(fullName, email);

  return (
    <>
      <main className="account-page">
        <section className="account-card">
          <div className="account-badge">ACCOUNT</div>

          <h1 className="account-title">계정 설정</h1>

          {error ? (
            <div className="account-alert account-alert-error">{error}</div>
          ) : null}

          {message ? (
            <div className="account-alert account-alert-message">{message}</div>
          ) : null}

          <div className="account-profile-head">
            <div className="account-profile-user">
              <div className="account-avatar">{initial}</div>

              <div className="account-profile-copy">
                <strong>{fullName || username || "사용자"}</strong>
                <span>{email || "이메일 없음"}</span>
              </div>
            </div>

            <div className="account-provider-box">
              <span>연결 방식</span>
              <strong>{providerLabel}</strong>
            </div>
          </div>

          <form action={updateAccountAction} className="account-form">
            <div className="account-grid">
              <label className="account-field">
                <span>이메일</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={email}
                  placeholder="이메일"
                  readOnly
                />
              </label>

              <label className="account-field">
                <span>이름</span>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={fullName}
                  placeholder="이름"
                />
              </label>

              <label className="account-field">
                <span>연락처</span>
                <input
                  type="tel"
                  name="phone_number"
                  defaultValue={phoneNumber}
                  placeholder="01012345678"
                  inputMode="tel"
                />
              </label>

              <label className="account-field">
                <span>아이디</span>
                <input
                  type="text"
                  name="username"
                  defaultValue={username}
                  placeholder="아이디"
                />
              </label>
            </div>

            <div className="account-actions">
              <button type="submit" className="account-primary-btn">
                저장
              </button>

              <Link href="/my/listings" className="account-secondary-btn">
                내 자산 보기
              </Link>
            </div>
          </form>
        </section>
      </main>

      <style>{`
        .account-page {
          width: 100%;
          min-height: calc(100dvh - 180px);
          padding: 32px 16px 96px;
          box-sizing: border-box;
        }

        .account-card {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          border: 1px solid #e3d4c1;
          border-radius: 32px;
          background: #fcfaf6;
          box-shadow: 0 18px 40px rgba(47, 36, 23, 0.06);
          padding: 18px 18px 20px;
          box-sizing: border-box;
        }

        .account-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #f1e6d6;
          color: #a07a4f;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .account-title {
          margin: 14px 0 18px;
          color: #1f140c;
          font-size: 52px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .account-alert {
          margin-bottom: 14px;
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 800;
        }

        .account-alert-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .account-alert-message {
          border: 1px solid #ddd2c2;
          background: #f8f3ea;
          color: #5d4731;
        }

        .account-profile-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border: 1px solid #e3d4c1;
          border-radius: 22px;
          background: #f6f0e6;
          padding: 16px;
        }

        .account-profile-user {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .account-avatar {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #eadfcf;
          color: #2f2417;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          flex-shrink: 0;
          border: 1px solid #d9c7af;
        }

        .account-profile-copy {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .account-profile-copy strong {
          color: #1f140c;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
        }

        .account-profile-copy span {
          color: #8f7658;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
          word-break: break-all;
        }

        .account-provider-box {
          flex-shrink: 0;
          min-width: 92px;
          display: grid;
          gap: 4px;
          border: 1px solid #dcc9b2;
          background: #fcfaf6;
          border-radius: 16px;
          padding: 12px 14px;
        }

        .account-provider-box span {
          color: #9a7a57;
          font-size: 11px;
          font-weight: 800;
        }

        .account-provider-box strong {
          color: #1f140c;
          font-size: 16px;
          font-weight: 900;
        }

        .account-form {
          margin-top: 16px;
        }

        .account-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .account-field {
          display: grid;
          gap: 8px;
        }

        .account-field span {
          color: #9a7a57;
          font-size: 12px;
          font-weight: 800;
        }

        .account-field input {
          width: 100%;
          height: 52px;
          border-radius: 16px;
          border: 1px solid #dfd2c1;
          background: #ffffff;
          padding: 0 14px;
          box-sizing: border-box;
          color: #1f140c;
          font-size: 14px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .account-field input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
        }

        .account-field input[readonly] {
          background: #f8f5ef;
          color: #7d664f;
        }

        .account-actions {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .account-primary-btn,
        .account-secondary-btn {
          min-height: 48px;
          padding: 0 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .account-primary-btn {
          border: none;
          background: #2f1d10;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.16);
        }

        .account-secondary-btn {
          border: 1px solid #dcc9b2;
          background: #eadfcf;
          color: #2f1d10;
        }

        @media (max-width: 768px) {
          .account-page {
            padding: 18px 12px 110px;
          }

          .account-card {
            border-radius: 24px;
            padding: 16px;
          }

          .account-title {
            font-size: 38px;
            margin: 12px 0 16px;
          }

          .account-profile-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .account-provider-box {
            width: 100%;
          }

          .account-grid {
            grid-template-columns: 1fr;
          }

          .account-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .account-primary-btn,
          .account-secondary-btn {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .account-title {
            font-size: 32px;
          }

          .account-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}