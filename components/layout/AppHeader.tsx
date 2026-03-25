"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppHeaderProps = {
  isLoggedIn: boolean;
  unreadCount: number;
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
  badge,
  strong = false,
}: {
  href: string;
  label: string;
  pathname: string;
  badge?: number;
  strong?: boolean;
}) {
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: active ? "#ffffff" : strong ? "#ffffff" : "#2f2417",
        background: active ? "#2f2417" : strong ? "#2f2417" : "#ffffff",
        border: active || strong ? "1px solid #2f2417" : "1px solid #eadfcf",
        padding: "10px 14px",
        borderRadius: 12,
        fontWeight: active ? 800 : 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        boxShadow: active ? "0 8px 18px rgba(47,36,23,0.12)" : "none",
      }}
      aria-current={active ? "page" : undefined}
    >
      <span>{label}</span>
      {typeof badge === "number" && badge > 0 ? (
        <span
          style={{
            background: active ? "#ffffff" : "#2f2417",
            color: active ? "#2f2417" : "#ffffff",
            minWidth: 22,
            height: 22,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
            padding: "0 6px",
            lineHeight: 1,
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function CurrentLocation({
  pathname,
}: {
  pathname: string;
}) {
  let label = "Home";

  if (pathname.startsWith("/listings/create")) {
    label = "Create Listing";
  } else if (pathname.startsWith("/listings/") && pathname.endsWith("/edit")) {
    label = "Edit Listing";
  } else if (pathname.startsWith("/listings/")) {
    label = "Listing Detail";
  } else if (pathname.startsWith("/listings")) {
    label = "Listings";
  } else if (pathname.startsWith("/deal/")) {
    label = "Deal Room";
  } else if (pathname.startsWith("/my/listings")) {
    label = "My Listings";
  } else if (pathname.startsWith("/my/deals")) {
    label = "My Deals";
  } else if (pathname.startsWith("/notifications")) {
    label = "Notifications";
  } else if (pathname.startsWith("/auth/login")) {
    label = "Login";
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#fbf8f3",
        border: "1px solid #eadfcf",
        borderRadius: 999,
        padding: "9px 12px",
        fontSize: 13,
        color: "#6b5845",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: "#2f2417",
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

export default function AppHeader({
  isLoggedIn,
  unreadCount,
}: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "blur(10px)",
        background: "rgba(246, 241, 231, 0.86)",
        borderBottom: "1px solid #eadfcf",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 16px",
          display: "grid",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#241b11",
                fontWeight: 900,
                fontSize: 24,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Msell
            </Link>

            <CurrentLocation pathname={pathname} />
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <NavLink href="/listings" label="Listings" pathname={pathname} />

            {isLoggedIn ? (
              <>
                <NavLink
                  href="/my/listings"
                  label="My Listings"
                  pathname={pathname}
                />
                <NavLink
                  href="/my/deals"
                  label="My Deals"
                  pathname={pathname}
                />
                <NavLink
                  href="/notifications"
                  label="알림"
                  pathname={pathname}
                  badge={unreadCount}
                  strong={unreadCount > 0}
                />

                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    style={{
                      border: 0,
                      cursor: "pointer",
                      color: "#2f2417",
                      background: "#eadfcf",
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <NavLink
                href="/auth/login"
                label="Login"
                pathname={pathname}
                strong
              />
            )}
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/listings/create"
            style={{
              textDecoration: "none",
              background: pathname.startsWith("/listings/create")
                ? "#2f2417"
                : "#ffffff",
              color: pathname.startsWith("/listings/create")
                ? "#ffffff"
                : "#2f2417",
              border: pathname.startsWith("/listings/create")
                ? "1px solid #2f2417"
                : "1px solid #eadfcf",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            + 새 등록글 작성
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              background: "#fbf8f3",
              color: "#6b5845",
              border: "1px solid #eadfcf",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            홈으로
          </Link>
        </div>
      </div>
    </header>
  );
}