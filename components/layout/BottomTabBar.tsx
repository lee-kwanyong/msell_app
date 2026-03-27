"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/listings", label: "거래", icon: "◫" },
  { href: "/listings/create", label: "등록", icon: "+" },
  { href: "/my/deals", label: "거래방", icon: "○" },
  { href: "/account", label: "마이", icon: "•" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 768);
    }

    setMounted(true);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!mounted || !isMobile) {
    return null;
  }

  return (
    <nav className="ms-bottom-tabbar" aria-label="모바일 하단 메뉴">
      <div className="ms-bottom-tabbar__inner">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`ms-bottom-tabbar__item${active ? " is-active" : ""}`}
            >
              <span className="ms-bottom-tabbar__icon">{tab.icon}</span>
              <span className="ms-bottom-tabbar__label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}