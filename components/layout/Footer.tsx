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
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid #e2d6c8",
        background: "#f6f1e7",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 20px 120px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#3b2414",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            M
          </div>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1f140d",
                lineHeight: 1.1,
              }}
            >
              Msell
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                letterSpacing: "0.16em",
                fontWeight: 700,
                color: "#9c7f62",
              }}
            >
              DIGITAL ASSET MARKETPLACE
            </div>
          </div>
        </div>

        <p
          style={{
            margin: 0,
            color: "#7b624d",
            fontSize: 15,
            lineHeight: 1.8,
            wordBreak: "keep-all",
          }}
        >
          Msell은 디지털 자산 거래 정보를 등록하고
          <br />
          거래 당사자 간 연결을 돕는 플랫폼입니다.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 24,
          }}
        >
          {POLICY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
                padding: "0 22px",
                borderRadius: 9999,
                border: "1px solid #dccfbe",
                background: "#fffdf9",
                color: "#5e4735",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}