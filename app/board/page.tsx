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
    { href: "/listings", label: "거래목록" },
    { href: "/board", label: "게시판" },
    { href: "/policy", label: "운영정책" },
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
    <header className="ms-header">
      <div className="ms-header__inner">
        <div className="ms-header__left">
          <Link href="/" className="ms-brand">
            <span className="ms-brand__logo">M</span>
            <span className="ms-brand__text">Msell</span>
          </Link>

          <nav className="ms-header__nav" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="ms-nav-pill">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ms-header__right">
          {user ? (
            <>
              <Link href="/account" className="ms-account-chip">
                <span className="ms-account-chip__avatar">
                  {username.slice(0, 1).toUpperCase()}
                </span>

                <span className="ms-account-chip__meta">
                  <span className="ms-account-chip__name">{username}</span>
                  <span className="ms-account-chip__provider">
                    {providerLabel(provider)}
                  </span>
                </span>
              </Link>

              <form action="/auth/logout" method="post">
                <button type="submit" className="ms-logout-button">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="ms-logout-button ms-logout-link">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}