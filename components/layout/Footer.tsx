import Link from "next/link";

const links = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/advertising-policy", label: "광고 운영정책" },
  { href: "/seller-policy", label: "판매자 등록정책" },
  { href: "/dispute-policy", label: "분쟁처리 및 신고정책" },
];

export default function Footer() {
  return (
    <footer style={footer}>
      <div style={inner}>
        <div style={topRow}>
          <div>
            <div style={brandRow}>
              <div style={mark}>M</div>
              <div>
                <div style={brand}>Msell</div>
                <div style={sub}>디지털 자산 거래 플랫폼</div>
              </div>
            </div>

            <div style={meta}>
              상위노출 및 광고상품은 유료 프로모션 서비스이며 거래 안전성이나
              성사 여부를 보장하지 않습니다.
            </div>
          </div>

          <nav style={nav}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={linkStyle}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={bottom}>© 2026 Msell. All rights reserved.</div>
      </div>
    </footer>
  );
}

const footer: React.CSSProperties = {
  background: "#fffdf9",
  borderTop: "1px solid #eadfcf",
  marginTop: 56,
};

const inner: React.CSSProperties = {
  maxWidth: 1480,
  margin: "0 auto",
  padding: "28px 32px 38px",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 28,
  flexWrap: "wrap",
};

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const mark: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#2f2417",
  color: "#f6f1e7",
  fontWeight: 900,
  fontSize: 20,
};

const brand: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1.1,
  fontWeight: 900,
  color: "#2f2417",
};

const sub: React.CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  color: "#8a6f4d",
  fontWeight: 700,
};

const nav: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 12px",
  maxWidth: 720,
};

const linkStyle: React.CSSProperties = {
  color: "#5c4a33",
  fontSize: 14,
  textDecoration: "none",
  fontWeight: 700,
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #e4d8c7",
  background: "#fff",
};

const meta: React.CSSProperties = {
  marginTop: 16,
  fontSize: 13,
  lineHeight: 1.8,
  color: "#8a6f4d",
  maxWidth: 560,
};

const bottom: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 18,
  borderTop: "1px solid #f0e6d9",
  fontSize: 13,
  color: "#8a6f4d",
};