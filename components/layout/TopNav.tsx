"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import GlobalToggle from "@/components/global/GlobalToggle";
import { supabaseBrowser } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
  cta?: boolean;
};

type AuthUser = {
  id: string;
  email?: string | null;
};

const navItems: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/listings", label: "거래목록" },
  { href: "/listings/create", label: "등록하기", cta: true },
  { href: "/dashboard", label: "대시보드" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const sb = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await sb.auth.getUser();

      if (!mounted) return;

      setUser(
        user
          ? {
              id: user.id,
              email: user.email ?? null,
            }
          : null
      );
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();

      if (!mounted) return;

      setUser(
        user
          ? {
              id: user.id,
              email: user.email ?? null,
            }
          : null
      );
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(246, 241, 231, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eadfcf",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            minWidth: 0,
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#2f2417",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            MSELL
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                    padding: item.cta ? "10px 14px" : "8px 12px",
                    borderRadius: 12,
                    border: item.cta
                      ? "1px solid #2f2417"
                      : active
                      ? "1px solid #c9ae87"
                      : "1px solid transparent",
                    background: item.cta
                      ? "#2f2417"
                      : active
                      ? "#fffaf2"
                      : "transparent",
                    color: item.cta ? "#ffffff" : "#2f2417",
                    fontWeight: 800,
                    fontSize: 14,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <GlobalToggle />

          {loading ? (
            <div
              style={{
                fontSize: 13,
                color: "#8b7a67",
                padding: "8px 10px",
              }}
            >
              확인중...
            </div>
          ) : user ? (
            <>
              <Link
                href="/my/listings"
                style={secondaryButtonStyle(isActive("/my/listings"))}
              >
                내 리스팅
              </Link>
              <Link
                href="/my/deals"
                style={secondaryButtonStyle(isActive("/my/deals"))}
              >
                내 거래
              </Link>
              <Link
                href="/account"
                style={secondaryButtonStyle(isActive("/account"))}
              >
                계정
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  style={{
                    border: "1px solid #d9c9b3",
                    background: "#ffffff",
                    color: "#2f2417",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={secondaryButtonStyle(isActive("/auth/login"))}>
                로그인
              </Link>
              <Link
                href="/auth/signup"
                style={{
                  textDecoration: "none",
                  border: "1px solid #2f2417",
                  background: "#2f2417",
                  color: "#ffffff",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontWeight: 800,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function secondaryButtonStyle(active: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    border: active ? "1px solid #c9ae87" : "1px solid #d9c9b3",
    background: active ? "#fffaf2" : "#ffffff",
    color: "#2f2417",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
    fontSize: 14,
    whiteSpace: "nowrap",
  };
}