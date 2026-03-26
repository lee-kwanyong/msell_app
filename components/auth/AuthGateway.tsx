'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

type AuthGatewayProps = {
  mode?: 'login' | 'signup'
  mobile?: boolean
}

type ProviderKey = 'google' | 'naver' | 'kakao'
type BuiltInOAuthProvider = 'google' | 'kakao'

const PROVIDER_LABEL: Record<ProviderKey, string> = {
  google: 'Google로 계속하기',
  naver: '네이버로 계속하기',
  kakao: '카카오로 계속하기',
}

const NAVER_PROVIDER_ID =
  process.env.NEXT_PUBLIC_NAVER_SUPABASE_PROVIDER_ID || 'custom:msell'

export default function AuthGateway({
  mode = 'login',
  mobile = false,
}: AuthGatewayProps) {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || (mobile ? '/m' : '/')
  const errorText = searchParams.get('error')
  const [loadingProvider, setLoadingProvider] = useState<ProviderKey | null>(null)

  const supabase = useMemo(() => supabaseBrowser(), [])

  const oauthCallbackUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL('/auth/callback', window.location.origin)
    url.searchParams.set('next', next)
    return url.toString()
  }, [next])

  async function startBuiltInOAuth(provider: BuiltInOAuthProvider) {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: oauthCallbackUrl,
        queryParams:
          provider === 'kakao'
            ? {
                prompt: 'login',
              }
            : undefined,
      },
    })
  }

  async function startCustomOAuth(providerId: string) {
    return supabase.auth.signInWithOAuth({
      provider: providerId as never,
      options: {
        redirectTo: oauthCallbackUrl,
      },
    })
  }

  async function handleOAuth(provider: ProviderKey) {
    try {
      setLoadingProvider(provider)

      const result =
        provider === 'naver'
          ? await startCustomOAuth(NAVER_PROVIDER_ID)
          : await startBuiltInOAuth(provider)

      if (result.error) {
        const message = encodeURIComponent(
          result.error.message || 'oauth_start_failed'
        )
        window.location.href = `${mobile ? '/m' : ''}/auth/${mode}?error=${message}&next=${encodeURIComponent(next)}`
        return
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'unexpected_oauth_error'
      window.location.href = `${mobile ? '/m' : ''}/auth/${mode}?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 10,
        }}
      >
        <SocialButton
          brand="google"
          text={PROVIDER_LABEL.google}
          loading={loadingProvider === 'google'}
          onClick={() => handleOAuth('google')}
        />
        <SocialButton
          brand="naver"
          text={PROVIDER_LABEL.naver}
          loading={loadingProvider === 'naver'}
          onClick={() => handleOAuth('naver')}
        />
        <SocialButton
          brand="kakao"
          text={PROVIDER_LABEL.kakao}
          loading={loadingProvider === 'kakao'}
          onClick={() => handleOAuth('kakao')}
        />
      </div>

      {errorText ? (
        <div
          style={{
            borderRadius: 14,
            padding: '12px 14px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#9a3412',
            fontSize: 13,
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {decodeURIComponent(errorText)}
        </div>
      ) : null}
    </div>
  )
}

function SocialButton({
  brand,
  text,
  loading,
  onClick,
}: {
  brand: ProviderKey
  text: string
  loading?: boolean
  onClick: () => void
}) {
  const styles = getBrandStyle(brand)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        height: 54,
        borderRadius: 16,
        border: styles.border,
        background: styles.background,
        color: styles.color,
        fontSize: 15,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          width: 22,
          justifyContent: 'center',
          fontWeight: 800,
        }}
      >
        {brand === 'google' ? 'G' : brand === 'naver' ? 'N' : 'K'}
      </span>
      <span>{loading ? '이동 중...' : text}</span>
    </button>
  )
}

function getBrandStyle(brand: ProviderKey) {
  switch (brand) {
    case 'google':
      return {
        background: '#ffffff',
        color: '#1f2937',
        border: '1px solid #d1d5db',
      }
    case 'naver':
      return {
        background: '#03c75a',
        color: '#ffffff',
        border: '1px solid #03c75a',
      }
    case 'kakao':
      return {
        background: '#fee500',
        color: '#191919',
        border: '1px solid #f2d600',
      }
  }
}