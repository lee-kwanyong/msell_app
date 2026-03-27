import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/my') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/listings/create') ||
    /\/listings\/[^/]+\/edit$/.test(pathname) ||
    pathname.startsWith('/deal')
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, any>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = NextResponse.next({
            request,
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, any>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          response = NextResponse.next({
            request,
          })

          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (user) {
      const next = request.nextUrl.searchParams.get('next')
      const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
      return NextResponse.redirect(new URL(target, request.url))
    }
    return response
  }

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search || ''}`)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/account/:path*',
    '/my/:path*',
    '/notifications/:path*',
    '/listings/create',
    '/listings/:path*/edit',
    '/deal/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}