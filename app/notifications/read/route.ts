import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function safeReturnTo(input: string | null) {
  if (!input) return '/notifications'
  if (!input.startsWith('/')) return '/notifications'
  if (input.startsWith('//')) return '/notifications'
  return input
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let notificationId = ''
    let returnTo = '/notifications'

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => null)
      notificationId = String(body?.notification_id || '').trim()
      returnTo = safeReturnTo(String(body?.return_to || '/notifications'))
    } else {
      const formData = await req.formData()
      notificationId = String(formData.get('notification_id') || '').trim()
      returnTo = safeReturnTo(String(formData.get('return_to') || '/notifications'))
    }

    if (!notificationId) {
      return NextResponse.redirect(new URL(`${returnTo}?error=missing_notification_id`, req.url), 303)
    }

    const supabase = supabaseAdmin()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      return NextResponse.redirect(new URL(`${returnTo}?error=read_failed`, req.url), 303)
    }

    return NextResponse.redirect(new URL(returnTo, req.url), 303)
  } catch {
    return NextResponse.redirect(new URL('/notifications?error=unexpected', req.url), 303)
  }
}