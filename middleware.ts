import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const MOBILE_PATH_PREFIXES = ['/m']
const PROTECTED_PREFIXES = ['/account', '/my', '/deal', '/admin']

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
  if (MOBILE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false
  if (isStaticPath(pathname)) return false
  if (pathname.startsWith('/auth')) return false
  return isMobileUserAgent(userAgent)
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const userAgent = request.headers.get('user-agent') ?? ''

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (shouldUseMobile(pathname, userAgent)) {
    const url = request.nextUrl.clone()
    url.pathname = `/m${pathname}`
    url.search = search
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/m') && !isMobileUserAgent(userAgent)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/m/, '') || '/'
    url.search = search
    return NextResponse.redirect(url)
  }

  const requiresAuth =
    pathname.startsWith('/listings/create') ||
    /^\/listings\/[^/]+\/edit$/.test(pathname) ||
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname + search)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}