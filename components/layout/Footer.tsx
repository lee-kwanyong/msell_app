import Link from "next/link";

const footerLinks = [
  { href: "/policies/terms", label: "이용약관" },
  { href: "/policies/privacy", label: "개인정보처리방침" },
  { href: "/policies/ad-policy", label: "광고 운영정책" },
  { href: "/policies/seller-policy", label: "판매자 등록정책" },
  { href: "/policies/dispute-policy", label: "분쟁처리 및 신고정책" },
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
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "28px 20px 34px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
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

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#fffdf9",
                  border: "1px solid #e3d5c3",
                  color: "#5e4a38",
                  fontSize: 13,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
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