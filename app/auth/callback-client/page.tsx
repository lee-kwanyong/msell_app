'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export default function AuthCallbackClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const run = async () => {
      const supabase = supabaseBrowser()
      const next = safeNextPath(searchParams.get('next'))

      const hash = window.location.hash.startsWith('#')
        ? new URLSearchParams(window.location.hash.slice(1))
        : new URLSearchParams()

      const hashError = hash.get('error_description') || hash.get('error')
      if (hashError) {
        router.replace(
          `/auth/login?error=${encodeURIComponent(
            `소셜 로그인 처리 중 오류가 발생했습니다.\n${hashError}`
          )}&next=${encodeURIComponent(next)}`
        )
        return
      }

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          router.replace(
            `/auth/login?error=${encodeURIComponent(
              `소셜 로그인 세션 처리 중 오류가 발생했습니다.\n${error.message}`
            )}&next=${encodeURIComponent(next)}`
          )
          return
        }

        router.replace(next)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.replace(next)
        return
      }

      router.replace(
        `/auth/login?error=${encodeURIComponent(
          '로그인 승인 코드가 없습니다. 다시 시도해 주세요.'
        )}&next=${encodeURIComponent(next)}`
      )
    }

    run()
  }, [router, searchParams])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f6f1e7',
        color: '#241b11',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          background: '#ffffff',
          border: '1px solid #e7dccb',
          padding: '28px 24px',
          boxShadow: '0 18px 40px rgba(47, 36, 23, 0.08)',
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        로그인 처리 중입니다...
      </div>
    </main>
  )
}