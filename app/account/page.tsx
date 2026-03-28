import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updateAccountAction } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

type ProfileRow = {
  full_name?: string | null;
  phone_number?: string | null;
  username?: string | null;
  gender?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
};

function providerLabel(provider?: string | null) {
  if (!provider) return "이메일";
  if (provider === "google") return "구글";
  if (provider === "kakao") return "카카오";
  if (provider === "naver" || provider === "custom:naver") return "네이버";
  return provider;
}

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, username, gender, email, avatar_url, provider")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const email = profile?.email || user.email || "";
  const fullName =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "");
  const phoneNumber =
    profile?.phone_number ||
    (typeof user.user_metadata?.phone_number === "string"
      ? user.user_metadata.phone_number
      : "");
  const username =
    profile?.username ||
    (typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : "");
  const gender = profile?.gender || "";
  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : "");
  const provider =
    profile?.provider ||
    (typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : "email");

  return (
    <>
      <main className="msell-account-page">
        <section className="msell-account-shell">
          <div className="msell-account-card">
            <div className="msell-account-top">
              <div className="msell-account-badge">ACCOUNT</div>
              <h1 className="msell-account-title">계정 설정</h1>
            </div>

            <div className="msell-account-hero">
              <div className="msell-account-identity">
                <div className="msell-account-avatar">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="프로필 이미지" />
                  ) : (
                    <span>{(fullName || email || "U").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>

                <div className="msell-account-summary">
                  <strong>{fullName || "이름 미설정"}</strong>
                  <p>{email || "이메일 없음"}</p>
                </div>
              </div>

              <div className="msell-account-provider">
                <span>연결 방식</span>
                <strong>{providerLabel(provider)}</strong>
              </div>
            </div>

            {error ? (
              <div className="msell-account-alert msell-account-alert-error">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="msell-account-alert msell-account-alert-message">
                {message}
              </div>
            ) : null}

            <form action={updateAccountAction} className="msell-account-form">
              <div className="msell-account-grid">
                <label htmlFor="email" className="msell-account-label">
                  <span>이메일</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    disabled
                    className="msell-account-input msell-account-input-disabled"
                  />
                </label>

                <label htmlFor="full_name" className="msell-account-label">
                  <span>이름</span>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="이름 입력"
                    defaultValue={fullName}
                    className="msell-account-input"
                  />
                </label>

                <label htmlFor="phone_number" className="msell-account-label">
                  <span>연락처</span>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="01012345678"
                    defaultValue={phoneNumber}
                    className="msell-account-input"
                  />
                </label>

                <label htmlFor="username" className="msell-account-label">
                  <span>아이디</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="영문, 숫자, _, . 가능"
                    defaultValue={username}
                    className="msell-account-input"
                  />
                </label>

                <label htmlFor="gender" className="msell-account-label">
                  <span>성별</span>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={gender}
                    className="msell-account-input"
                  >
                    <option value="">선택 안 함</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </label>
              </div>

              <div className="msell-account-actions">
                <button type="submit" className="msell-account-submit">
                  저장
                </button>

                <Link href="/my/listings" className="msell-account-secondary">
                  내 자산 보기
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      <style>{`
        .msell-account-page {
          width: 100%;
          min-height: calc(100dvh - 180px);
          padding: clamp(20px, 4vw, 56px) 16px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .msell-account-shell {
          width: 100%;
          max-width: 860px;
        }

        .msell-account-card {
          width: 100%;
          border-radius: 28px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 24px 60px rgba(47, 36, 23, 0.08);
          padding: 26px;
          box-sizing: border-box;
        }

        .msell-account-top {
          margin-bottom: 18px;
        }

        .msell-account-badge {
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

        .msell-account-title {
          margin: 14px 0 0;
          color: #1f140c;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-account-hero {
          margin-bottom: 18px;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid #efe4d5;
          background: #fbf6ee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .msell-account-identity {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .msell-account-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          overflow: hidden;
          background: #eadfcf;
          border: 1px solid #dfd0bb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2f2417;
          font-size: 20px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .msell-account-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msell-account-summary {
          min-width: 0;
        }

        .msell-account-summary strong {
          display: block;
          color: #1f140c;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
        }

        .msell-account-summary p {
          margin: 6px 0 0;
          color: #8f7658;
          font-size: 13px;
          font-weight: 700;
          word-break: break-all;
        }

        .msell-account-provider {
          display: grid;
          gap: 6px;
          min-width: 120px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid #eadfce;
          background: #fffdfa;
        }

        .msell-account-provider span {
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .msell-account-provider strong {
          color: #1f140c;
          font-size: 14px;
          font-weight: 900;
        }

        .msell-account-alert {
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-account-alert-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .msell-account-alert-message {
          border: 1px solid #d9d2c3;
          background: #f8f3ea;
          color: #5b4631;
        }

        .msell-account-form {
          display: grid;
          gap: 18px;
        }

        .msell-account-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .msell-account-label {
          display: grid;
          gap: 8px;
        }

        .msell-account-label span {
          color: #8f7658;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-account-input {
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

        .msell-account-input::placeholder {
          color: #b4a089;
        }

        .msell-account-input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
          transform: translateY(-1px);
        }

        .msell-account-input-disabled {
          color: #8f7658;
          background: #f7f1e8;
          cursor: not-allowed;
        }

        .msell-account-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .msell-account-submit {
          min-width: 140px;
          height: 54px;
          padding: 0 22px;
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

        .msell-account-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(47, 29, 16, 0.22);
          filter: brightness(1.02);
        }

        .msell-account-secondary {
          min-width: 140px;
          height: 54px;
          padding: 0 22px;
          border-radius: 999px;
          border: 1px solid #dfd0bb;
          background: #eadfcf;
          color: #2f2417;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .msell-account-secondary:hover {
          transform: translateY(-1px);
          background: #dfd0bb;
          box-shadow: 0 10px 20px rgba(47, 36, 23, 0.08);
        }

        @media (max-width: 760px) {
          .msell-account-page {
            padding: 14px 12px 20px;
          }

          .msell-account-card {
            border-radius: 22px;
            padding: 18px 16px 20px;
            box-shadow: 0 16px 34px rgba(47, 36, 23, 0.08);
          }

          .msell-account-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .msell-account-title {
            font-size: 28px;
          }

          .msell-account-hero {
            padding: 14px;
            border-radius: 18px;
          }

          .msell-account-input,
          .msell-account-submit,
          .msell-account-secondary {
            height: 52px;
            width: 100%;
          }

          .msell-account-actions {
            display: grid;
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 380px) {
          .msell-account-card {
            padding: 16px 14px 18px;
          }

          .msell-account-title {
            font-size: 26px;
          }

          .msell-account-avatar {
            width: 52px;
            height: 52px;
          }

          .msell-account-input,
          .msell-account-submit,
          .msell-account-secondary {
            height: 50px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}