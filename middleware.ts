import { NextRequest, NextResponse } from "next/server";

const MOBILE_ONLY_REDIRECT_TARGETS = new Set([
  "/",
  "/listings",
  "/auth/login",
  "/auth/signup",
]);

const DESKTOP_ONLY_POLICY_ROUTES = new Set([
  "/terms",
  "/privacy",
  "/advertising-policy",
  "/seller-policy",
  "/dispute-policy",
]);

function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

function shouldRedirectToMobile(pathname: string) {
  return MOBILE_ONLY_REDIRECT_TARGETS.has(pathname);
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw") ||
    pathname.startsWith("/offline")
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const pathname = nextUrl.pathname;
  const userAgent = headers.get("user-agent") || "";
  const isMobile = isMobileUserAgent(userAgent);

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 잘못된 /m 정책 경로 -> 실제 정책 경로로 복귀
  if (pathname === "/m/terms") {
    return NextResponse.redirect(new URL("/terms", request.url));
  }
  if (pathname === "/m/privacy") {
    return NextResponse.redirect(new URL("/privacy", request.url));
  }
  if (pathname === "/m/advertising-policy") {
    return NextResponse.redirect(new URL("/advertising-policy", request.url));
  }
  if (pathname === "/m/seller-policy") {
    return NextResponse.redirect(new URL("/seller-policy", request.url));
  }
  if (pathname === "/m/dispute-policy") {
    return NextResponse.redirect(new URL("/dispute-policy", request.url));
  }

  // 정책 페이지는 모바일에서도 desktop route 그대로 사용
  if (DESKTOP_ONLY_POLICY_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // 모바일 전용 라우트가 없는 페이지는 /m 붙이지 않음
  if (isMobile && !pathname.startsWith("/m")) {
    if (shouldRedirectToMobile(pathname)) {
      const url = nextUrl.clone();
      url.pathname = pathname === "/" ? "/m" : `/m${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};