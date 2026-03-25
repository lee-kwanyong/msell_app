import Link from "next/link";

export default function Header() {
  return (
    <header style={header}>
      <div style={inner}>
        <Link href="/" style={brandLink}>
          <div style={markWrap}>
            <div style={markShadow} />
            <div style={mark}>M</div>
          </div>

          <div style={brandTextWrap}>
            <div style={brandTitle}>Msell</div>
            <div style={brandSub}>Digital Asset Marketplace</div>
          </div>
        </Link>

        <nav style={nav}>
          <Link href="/listings" className="msell-nav-pill" style={navLink}>
            거래목록
          </Link>
          <Link
            href="/listings/create"
            className="msell-nav-pill"
            style={navLink}
          >
            등록하기
          </Link>
          <Link
            href="/my/listings"
            className="msell-nav-pill"
            style={navLink}
          >
            내 자산
          </Link>
          <Link href="/my/deals" className="msell-nav-pill" style={navLink}>
            내 거래
          </Link>
          <Link href="/account" className="msell-nav-pill" style={navLink}>
            계정
          </Link>

          <form action="/auth/logout" method="post" style={{ margin: 0 }}>
            <button
              type="submit"
              className="msell-dark-pill"
              style={logoutButton}
            >
              로그아웃
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

const header: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(246, 241, 231, 0.9)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #e8ddcd",
};

const inner: React.CSSProperties = {
  maxWidth: 1480,
  margin: "0 auto",
  padding: "18px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
};

const brandLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  textDecoration: "none",
};

const markWrap: React.CSSProperties = {
  position: "relative",
  width: 54,
  height: 54,
};

const markShadow: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 18,
  background: "rgba(47,36,23,0.12)",
  transform: "translateY(4px) scale(0.96)",
  filter: "blur(8px)",
};

const mark: React.CSSProperties = {
  position: "relative",
  width: 54,
  height: 54,
  borderRadius: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, #2f2417 0%, #4a3823 55%, #2f2417 100%)",
  color: "#f6f1e7",
  fontSize: 28,
  fontWeight: 900,
  boxShadow: "0 12px 24px rgba(47,36,23,0.18)",
};

const brandTextWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const brandTitle: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
  fontWeight: 900,
  color: "#2f2417",
};

const brandSub: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.2,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#8a6f4d",
  fontWeight: 800,
};

const nav: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
};

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#2f2417",
  fontSize: 14,
  fontWeight: 800,
  padding: "12px 18px",
  borderRadius: 999,
  border: "1px solid #d9ccb8",
  background: "rgba(255,255,255,0.7)",
  boxShadow: "0 4px 10px rgba(47,36,23,0.03)",
  transition: "all 0.18s ease",
};

const logoutButton: React.CSSProperties = {
  border: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  fontSize: 14,
  fontWeight: 800,
  padding: "12px 18px",
  borderRadius: 999,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(47,36,23,0.12)",
  transition: "all 0.18s ease",
};