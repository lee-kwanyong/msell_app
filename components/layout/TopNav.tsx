"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import GlobalToggle from "@/components/global/GlobalToggle";
import { supabase } from "@/lib/supabaseClient";

type NavItem = { href: string; label: string; cta?: boolean };

function joinClass(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function TopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const qFromUrl = useMemo(() => searchParams?.get("q") ?? "", [searchParams]);
  const [q, setQ] = useState(qFromUrl);

  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => setQ(qFromUrl), [qFromUrl]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const boardHref = "/board?type=sell";

  const navItems: NavItem[] = [
    { href: boardHref, label: "Board" },
    { href: "/deals", label: "Deals" },
    { href: "/listings/new", label: "Sell", cta: true },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    const pureHref = href.split("?")[0];
    if (pureHref === "/") return pathname === "/";
    return pathname === pureHref || pathname.startsWith(pureHref + "/");
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();

    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");

    router.push(`/board?${next.toString()}`);
  };

  const nextEncoded = useMemo(() => {
    const path = pathname || "/";
    const qs = searchParams?.toString() || "";
    const full = qs ? `${path}?${qs}` : path;
    return encodeURIComponent(full);
  }, [pathname, searchParams]);

  const loginHref = `/auth/login?next=${nextEncoded}`;
  const signupHref = `/auth/signup?next=${nextEncoded}`;

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="glassbar">
      <div className="apple-container navrow">
        <Link className="brand" href="/">
          Msell <small>Verified Ownership & Operator Transfers</small>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <form onSubmit={onSubmitSearch} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              className="navSearch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (YouTube, Discord, domain, newsletter...)"
              aria-label="Search"
            />
          </form>

          <GlobalToggle />
        </div>

        <nav className="navlinks" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={joinClass(item.cta && "navCta")}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}

          {!authLoading && !session?.user && (
            <>
              <Link href={loginHref}>Login</Link>
              <Link href={signupHref} className="navCta">
                Sign up
              </Link>
            </>
          )}

          {!authLoading && session?.user && (
            <button
              type="button"
              onClick={logout}
              className="navCta"
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 999,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}