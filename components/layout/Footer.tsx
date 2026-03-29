import Link from "next/link";

const POLICY_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/advertising-policy", label: "광고 운영정책" },
  { href: "/seller-policy", label: "판매자 등록정책" },
  { href: "/dispute-policy", label: "분쟁처리 및 신고정책" },
];

export default function Footer() {
  return (
    <>
      <footer className="msell-footer">
        <div className="msell-footer__inner">
          <div className="msell-footer__brand">
            <div className="msell-footer__brand-row">
              <div className="msell-footer__logo">M</div>
              <div className="msell-footer__brand-copy">
                <strong className="msell-footer__brand-name">Msell</strong>
                <span className="msell-footer__brand-sub">
                  DIGITAL ASSET MARKETPLACE
                </span>
              </div>
            </div>

            <p className="msell-footer__desc">
              Msell은 디지털 자산 거래 정보를 등록하고
              <br />
              거래 당사자 간 연결을 돕는 플랫폼입니다.
            </p>
          </div>

          <nav className="msell-footer__nav" aria-label="Footer policy links">
            {POLICY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="msell-footer__link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

      <style>{`
        .msell-footer {
          width: 100%;
          border-top: 1px solid #e6d9c8;
          background: #f6f1e7;
        }

        .msell-footer__inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-sizing: border-box;
        }

        .msell-footer__brand {
          flex: 0 0 360px;
          min-width: 320px;
          display: grid;
          gap: 12px;
        }

        .msell-footer__brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .msell-footer__logo {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #3a2212;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
          flex-shrink: 0;
          box-shadow: 0 6px 14px rgba(58, 34, 18, 0.12);
        }

        .msell-footer__brand-copy {
          min-width: 0;
          display: grid;
          gap: 1px;
        }

        .msell-footer__brand-name {
          color: #1f140c;
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .msell-footer__brand-sub {
          color: #9a7a57;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .msell-footer__desc {
          margin: 0;
          color: #8d7458;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 700;
        }

        .msell-footer__nav {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-wrap: nowrap;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          white-space: nowrap;
        }

        .msell-footer__link {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #e2d2bd;
          background: rgba(255, 255, 255, 0.72);
          color: #3a2212;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.01em;
          transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
          box-sizing: border-box;
          flex: 0 0 auto;
        }

        .msell-footer__link:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(58, 34, 18, 0.08);
          background: #ffffff;
        }

        @media (max-width: 1100px) {
          .msell-footer__inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .msell-footer__brand {
            flex: none;
            min-width: 0;
            width: 100%;
          }

          .msell-footer__nav {
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 2px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .msell-footer__nav::-webkit-scrollbar {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .msell-footer__inner {
            padding: 20px 16px calc(112px + env(safe-area-inset-bottom, 0px));
            gap: 16px;
          }

          .msell-footer__brand-row {
            gap: 10px;
          }

          .msell-footer__logo {
            width: 30px;
            height: 30px;
            border-radius: 9px;
            font-size: 18px;
          }

          .msell-footer__brand-name {
            font-size: 17px;
          }

          .msell-footer__brand-sub {
            font-size: 10px;
          }

          .msell-footer__desc {
            font-size: 12px;
            line-height: 1.55;
          }

          .msell-footer__nav {
            gap: 8px;
          }

          .msell-footer__link {
            min-height: 36px;
            padding: 0 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}