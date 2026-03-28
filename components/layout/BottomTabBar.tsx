"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type NavItem = {
  key: string;
  label: string;
  href: string;
  protected?: boolean;
  cta?: boolean;
  match: (pathname: string) => boolean;
  icon: (active: boolean) => JSX.Element;
};

function HomeIcon(active: boolean) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListingsIcon(active: boolean) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="3"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
      />
      <path
        d="M8 10h8M8 14h5"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon(active: boolean) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke={active ? "#ffffff" : "#2f2417"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DealsIcon(active: boolean) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-4.5L8 20v-3H7a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3Z"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon(active: boolean) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
      />
      <path
        d="M5 19.5c1.8-2.7 4.1-4 7-4s5.2 1.3 7 4"
        stroke={active ? "#2f2417" : "#8f7658"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setIsLoggedIn(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const items = useMemo<NavItem[]>(
    () => [
      {
        key: "home",
        label: "홈",
        href: "/m",
        match: (current) => current === "/m",
        icon: HomeIcon,
      },
      {
        key: "listings",
        label: "목록",
        href: "/m/listings",
        match: (current) =>
          current === "/m/listings" || current.startsWith("/m/listings/"),
        icon: ListingsIcon,
      },
      {
        key: "create",
        label: "등록",
        href: "/m/listings/create",
        protected: true,
        cta: true,
        match: (current) => current === "/m/listings/create",
        icon: PlusIcon,
      },
      {
        key: "deals",
        label: "내 거래",
        href: "/m/my/deals",
        protected: true,
        match: (current) =>
          current === "/m/my/deals" || current.startsWith("/deal/"),
        icon: DealsIcon,
      },
      {
        key: "account",
        label: "계정",
        href: "/account",
        protected: true,
        match: (current) =>
          current === "/account" ||
          current.startsWith("/account/") ||
          current === "/m/account" ||
          current.startsWith("/m/account/"),
        icon: AccountIcon,
      },
    ],
    []
  );

  const resolvedItems = items.map((item) => {
    if (!item.protected) return item;

    const next = item.href;
    return {
      ...item,
      href: isLoggedIn
        ? item.href
        : `/m/auth/login?next=${encodeURIComponent(next)}`,
    };
  });

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/m/auth") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <>
      <nav className="msell-bottom-tab" aria-label="모바일 하단 탭">
        <div className="msell-bottom-tab__inner">
          {resolvedItems.map((item) => {
            const active = item.match(pathname);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  "msell-bottom-tab__item",
                  active ? "is-active" : "",
                  item.cta ? "is-cta" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <span className="msell-bottom-tab__icon">
                  {item.icon(active || !!item.cta)}
                </span>
                <span className="msell-bottom-tab__label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        .msell-bottom-tab {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 60;
          display: none;
          padding:
            10px
            12px
            calc(10px + env(safe-area-inset-bottom));
          background:
            linear-gradient(
              180deg,
              rgba(246, 241, 231, 0) 0%,
              rgba(246, 241, 231, 0.92) 24%,
              rgba(246, 241, 231, 0.98) 100%
            );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .msell-bottom-tab__inner {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          padding: 8px;
          border: 1px solid rgba(223, 208, 187, 0.92);
          border-radius: 24px;
          background: rgba(255, 253, 250, 0.96);
          box-shadow: 0 16px 40px rgba(47, 36, 23, 0.12);
        }

        .msell-bottom-tab__item {
          min-width: 0;
          height: 58px;
          padding: 6px 4px;
          border-radius: 18px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #8f7658;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            box-shadow 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .msell-bottom-tab__item:active {
          transform: scale(0.98);
        }

        .msell-bottom-tab__item.is-active {
          background: #f3e8d8;
          color: #2f2417;
          box-shadow: inset 0 0 0 1px rgba(223, 208, 187, 0.95);
        }

        .msell-bottom-tab__item.is-cta {
          background: linear-gradient(180deg, #eadfcf 0%, #e3d3bc 100%);
          box-shadow:
            inset 0 0 0 1px rgba(223, 208, 187, 0.98),
            0 8px 18px rgba(47, 36, 23, 0.08);
          color: #2f2417;
        }

        .msell-bottom-tab__item.is-cta.is-active {
          background: linear-gradient(180deg, #2f2417 0%, #241b11 100%);
          color: #ffffff;
          box-shadow:
            0 10px 24px rgba(47, 36, 23, 0.2),
            inset 0 0 0 1px rgba(47, 36, 23, 0.3);
        }

        .msell-bottom-tab__icon {
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .msell-bottom-tab__label {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        @media (max-width: 1024px) {
          .msell-bottom-tab {
            display: block;
          }
        }

        @media (max-width: 380px) {
          .msell-bottom-tab {
            padding-left: 10px;
            padding-right: 10px;
          }

          .msell-bottom-tab__inner {
            gap: 6px;
            padding: 7px;
            border-radius: 22px;
          }

          .msell-bottom-tab__item {
            height: 56px;
            border-radius: 16px;
          }

          .msell-bottom-tab__label {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}