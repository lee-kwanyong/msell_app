import { NextRequest, NextResponse } from 'next/server'

const MOBILE_PREFIX = '/m'

function isStaticPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/i.test(pathname)
  )
}

function isMobileUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  return (
    ua.includes('iphone') ||
    ua.includes('ipod') ||
    ua.includes('android') ||
    ua.includes('mobile') ||
    ua.includes('windows phone') ||
    ua.includes('opera mini') ||
    ua.includes('iemobile') ||
    ua.includes('blackberry') ||
    ua.includes('silk')
  )
}

function hasMobileEquivalent(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/listings' ||
    pathname === '/auth/login' ||
    pathname === '/auth/signup'
  )
}

function toMobilePath(pathname: string) {
  if (pathname === '/') return '/m'
  return `${MOBILE_PREFIX}${pathname}`
}

function toDesktopPath(pathname: string) {
  if (pathname === '/m') return '/'
  return pathname.replace(/^\/m/, '') || '/'
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (isStaticPath(pathname)) {
    return NextResponse.next()
  }

  const ua = request.headers.get('user-agent') || ''
  const isMobile = isMobileUserAgent(ua)
  const isMobileRoute = pathname === '/m' || pathname.startsWith('/m/')

  const view = searchParams.get('view')

  if (view === 'desktop' && isMobileRoute) {
    const url = request.nextUrl.clone()
    url.pathname = toDesktopPath(pathname)
    url.searchParams.delete('view')
    return NextResponse.redirect(url)
  }

  if (view === 'mobile' && !isMobileRoute && hasMobileEquivalent(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = toMobilePath(pathname)
    url.searchParams.delete('view')
    return NextResponse.redirect(url)
  }

  if (isMobile && !isMobileRoute && hasMobileEquivalent(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = toMobilePath(pathname)
    return NextResponse.redirect(url)
  }

  if (!isMobile && isMobileRoute) {
    const url = request.nextUrl.clone()
    url.pathname = toDesktopPath(pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}