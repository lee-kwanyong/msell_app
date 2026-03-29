import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default async function Header() {
  const supabase = await supabaseServer();

  const [
    {
      data: { user },
    },
    { data: siteStats },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("site_stats")
      .select("total_visitors")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const totalVisitors = Number(siteStats?.total_visitors ?? 0);

  return (
    <>
      <header className="msell-header">
        <div className="msell-header__inner">
          <Link href="/" className="msell-header__brand">
            <span className="msell-header__brand-mark">M</span>
            <span className="msell-header__brand-copy">
              <strong>Msell</strong>
              <em>DIGITAL ASSET MARKETPLACE</em>
            </span>
          </Link>

          <nav className="msell-header__nav">
            <Link href="/listings" className="msell-header__nav-link">
              거래목록
            </Link>
            <Link href="/listings/create" className="msell-header__nav-link">
              자산등록
            </Link>
            <Link href="/my/listings" className="msell-header__nav-link">
              내 자산
            </Link>
            <Link href="/my/deals" className="msell-header__nav-link">
              내 거래
            </Link>
          </nav>

          <div className="msell-header__actions">
            {user ? (
              <>
                <Link href="/account" className="msell-header__ghost">
                  계정
                </Link>

                <form action="/auth/logout" method="post" className="msell-header__logout-form">
                  <button type="submit" className="msell-header__primary">
                    로그아웃
                  </button>
                </form>

                <div className="msell-header__visitor-chip" title="누적 방문자 수">
                  <span className="msell-header__visitor-label">방문</span>
                  <strong className="msell-header__visitor-value">
                    {formatNumber(totalVisitors)}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="msell-header__ghost">
                  로그인
                </Link>
                <Link href="/auth/signup" className="msell-header__primary">
                  회원가입
                </Link>
                <div className="msell-header__visitor-chip" title="누적 방문자 수">
                  <span className="msell-header__visitor-label">방문</span>
                  <strong className="msell-header__visitor-value">
                    {formatNumber(totalVisitors)}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <style>{`
        .msell-header {
          position: sticky;
          top: 0;
          z-index: 40;
          width: 100%;
          backdrop-filter: blur(14px);
          background: rgba(246, 241, 231, 0.88);
          border-bottom: 1px solid #e6d9c8;
        }

        .msell-header__inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          box-sizing: border-box;
        }

        .msell-header__brand {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
        }

        .msell-header__brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #2f2417;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
          box-shadow: 0 8px 18px rgba(47, 36, 23, 0.14);
        }

        .msell-header__brand-copy {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .msell-header__brand-copy strong {
          color: #1f140c;
          font-size: 22px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .msell-header__brand-copy em {
          color: #9a7a57;
          font-size: 11px;
          line-height: 1.2;
          font-style: normal;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .msell-header__nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          flex-wrap: wrap;
        }

        .msell-header__nav-link {
          min-height: 42px;
          padding: 0 14px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #5d4731;
          font-size: 14px;
          font-weight: 800;
          transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
        }

        .msell-header__nav-link:hover {
          background: rgba(255,255,255,0.72);
          color: #1f140c;
          transform: translateY(-1px);
        }

        .msell-header__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }

        .msell-header__ghost,
        .msell-header__primary {
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
          box-sizing: border-box;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .msell-header__ghost {
          background: #fff;
          color: #2f2417;
          border-color: #e2d1ba;
        }

        .msell-header__primary {
          background: #2f2417;
          color: #fff;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(47, 36, 23, 0.12);
        }

        .msell-header__ghost:hover,
        .msell-header__primary:hover {
          transform: translateY(-1px);
        }

        .msell-header__logout-form {
          margin: 0;
        }

        .msell-header__visitor-chip {
          min-height: 42px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #dccbb4;
          background: #efe4d4;
          color: #2f2417;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .msell-header__visitor-label {
          color: #8c6c49;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-header__visitor-value {
          color: #1f140c;
          font-size: 14px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        @media (max-width: 1080px) {
          .msell-header__inner {
            flex-wrap: wrap;
          }

          .msell-header__nav {
            order: 3;
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .msell-header__inner {
            padding: 12px 14px;
            gap: 12px;
          }

          .msell-header__brand-mark {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            font-size: 22px;
          }

          .msell-header__brand-copy strong {
            font-size: 20px;
          }

          .msell-header__brand-copy em {
            font-size: 10px;
          }

          .msell-header__actions {
            gap: 8px;
            flex-wrap: wrap;
          }

          .msell-header__ghost,
          .msell-header__primary,
          .msell-header__visitor-chip {
            min-height: 38px;
            padding: 0 12px;
          }

          .msell-header__nav {
            gap: 8px;
          }

          .msell-header__nav-link {
            min-height: 38px;
            padding: 0 12px;
            font-size: 13px;
          }

          .msell-header__visitor-label {
            font-size: 11px;
          }

          .msell-header__visitor-value {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}