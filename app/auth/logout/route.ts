import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await supabaseServer()

  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/auth/login?success=logout', request.url), {
    status: 303,
  })

  response.headers.set('Cache-Control', 'no-store, max-age=0')

  return response
}

export async function GET(request: Request) {
  const supabase = await supabaseServer()

  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/auth/login?success=logout', request.url), {
    status: 303,
  })

  response.headers.set('Cache-Control', 'no-store, max-age=0')

  return response
}