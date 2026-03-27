import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

function providerLabel(provider?: string | null) {
  if (!provider) return "Email 로그인";
  if (provider === "google") return "Google 로그인";
  if (provider === "kakao") return "Kakao 로그인";
  if (provider === "custom:naver") return "Naver 로그인";
  return `${provider} 로그인`;
}

type NavItem = {
  href: string;
  label: string;
};

export default async function Header() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navItems: NavItem[] = [
    { href: "/", label: "홈" },
    { href: "/listings", label: "거래목록" },
    { href: "/listings/create", label: "자산등록" },
    { href: "/my/listings", label: "내 매물" },
    { href: "/my/deals", label: "내 거래" },
    { href: "/account", label: "계정" },
  ];

  const username =
    (user?.user_metadata?.username as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "게스트";

  const provider =
    typeof user?.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : null;

  return (
    <header
      style={{
        width: "100%",
        borderBottom: "1px solid #eadfce",
        background: "#f6f1e7",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "#20150d",
              minWidth: "fit-content",
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2b1d12 0%, #6f4725 100%)",
                color: "#fffaf2",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 900,
                boxShadow: "0 8px 20px rgba(47, 36, 23, 0.18)",
              }}
            >
              M
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              Msell
            </span>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: "1px solid #d8cab8",
                  background:
                    item.href === "/listings/create" ? "#2f2417" : "#f9f5ee",
                  color: item.href === "/listings/create" ? "#fffaf2" : "#2f2417",
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow:
                    item.href === "/listings/create"
                      ? "0 10px 18px rgba(47, 36, 23, 0.18)"
                      : "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {user ? (
            <>
              <Link
                href="/account"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  color: "#2f2417",
                  border: "1px solid #d8cab8",
                  background: "#fbf7f1",
                  borderRadius: 999,
                  padding: "7px 12px 7px 8px",
                  minHeight: 44,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#2f2417",
                    color: "#fffaf2",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {username.slice(0, 1).toUpperCase()}
                </span>
                <span style={{ display: "grid", lineHeight: 1.1 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#2f2417",
                    }}
                  >
                    {username}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#8a7156",
                    }}
                  >
                    {providerLabel(provider)}
                  </span>
                </span>
              </Link>

              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  style={{
                    height: 44,
                    padding: "0 16px",
                    borderRadius: 14,
                    border: 0,
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(47, 36, 23, 0.18)",
                  }}
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/login"
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                border: 0,
                background: "#2f2417",
                color: "#fffaf2",
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}