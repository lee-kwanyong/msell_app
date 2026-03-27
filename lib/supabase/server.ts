import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function supabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({
              name,
              value,
              ...(options || {}),
            })
          } catch {
            // 서버 컴포넌트에서 set이 막히는 경우가 있어서 무시
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...(options || {}),
              maxAge: 0,
            })
          } catch {
            // 서버 컴포넌트에서 remove가 막히는 경우가 있어서 무시
          }
        },
      },
    },
  )
}