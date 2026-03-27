import { NextResponse, type NextRequest } from 'next/server'

function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

function isStaticPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/manifest') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.xml')
  )
}

function shouldUseMobile(pathname: string, userAgent: string) {
  if (pathname === '/m' || pathname.startsWith('/m/')) return false
  if (isStaticPath(pathname)) return false
  if (pathname.startsWith('/auth')) return false
  return isMobileUserAgent(userAgent)
}

function isMobileRoute(pathname: string) {
  return pathname === '/m' || pathname.startsWith('/m/')
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const userAgent = request.headers.get('user-agent') ?? ''

  if (shouldUseMobile(pathname, userAgent)) {
    const url = request.nextUrl.clone()
    url.pathname = `/m${pathname}`
    url.search = search
    return NextResponse.redirect(url)
  }

  if (isMobileRoute(pathname) && !isMobileUserAgent(userAgent)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/m(?=\/|$)/, '') || '/'
    url.search = search
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}