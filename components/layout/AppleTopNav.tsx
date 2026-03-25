import Link from "next/link";

export default function AppleTopNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #d2d2d7",
      }}
    >
      <div
        className="apple-container"
        style={{ height: 52, display: "flex", alignItems: "center", gap: 18 }}
      >
        <Link href="/" style={{ fontSize: 13, fontWeight: 650 }}>
          Msell
        </Link>

        <div style={{ flex: 1 }} />

        <nav style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <Link href="/listings">Listings</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </nav>

        <Link href="/listings" className="apple-btn apple-btn-primary">
          View listings ›
        </Link>
      </div>
    </header>
  );
}