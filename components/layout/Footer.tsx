import Link from "next/link";

const footerLinks = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/advertising-policy", label: "광고 운영정책" },
  { href: "/seller-policy", label: "판매자 등록정책" },
  { href: "/dispute-policy", label: "분쟁처리 및 신고정책" },
];

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 48,
        borderTop: "1px solid #e7dccd",
        background: "#f6f1e7",
      }}
    >
      <style>{`
        .msell-footer-top {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .msell-footer-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
          flex: 1;
        }

        .msell-footer-link {
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: #fffdf9;
          border: 1px solid #e3d5c3;
          color: #5e4a38;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .msell-footer-top {
            flex-direction: column;
            gap: 24px;
          }

          .msell-footer-links {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .msell-footer-link {
            width: 100%;
            min-height: 48px;
            height: 48px;
            font-size: 15px;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "28px 20px 34px",
        }}
      >
        <div className="msell-footer-top">
          <div style={{ minWidth: 260 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                M
              </span>

              <div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Msell
                </div>

                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  DIGITAL ASSET MARKETPLACE
                </div>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                color: "#8a7156",
                fontSize: 13,
                lineHeight: 1.8,
                fontWeight: 600,
              }}
            >
              Msell은 디지털 자산 거래 정보를 등록하고
              <br />
              거래 당사자 간 연결을 돕는 플랫폼입니다.
            </p>
          </div>

          <div className="msell-footer-links">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="msell-footer-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #eadfce",
            color: "#9a8268",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          © 2026 Msell. All rights reserved.
        </div>
      </div>
    </footer>
  );
}