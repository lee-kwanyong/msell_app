'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

type AuthGatewayProps = {
  next?: string
  mode?: 'login' | 'signup'
  mobile?: boolean
}

function safeNextPath(input?: string) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

function providerLabel(provider: 'google' | 'custom:naver' | 'kakao') {
  switch (provider) {
    case 'google':
      return 'Google'
    case 'custom:naver':
      return 'Naver'
    case 'kakao':
      return 'Kakao'
    default:
      return '로그인'
  }
}

export default function AuthGateway({
  next,
  mode = 'login',
  mobile = false,
}: AuthGatewayProps) {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const [loadingProvider, setLoadingProvider] = useState<string>('')

  const safeNext = safeNextPath(next)

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`
      : undefined

  async function handleOAuthLogin(provider: 'google' | 'custom:naver' | 'kakao') {
    try {
      setLoadingProvider(provider)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })

      if (error) {
        router.push(
          `/auth/login?error=${encodeURIComponent(
            error.message || `${providerLabel(provider)} 로그인에 실패했습니다.`
          )}&next=${encodeURIComponent(safeNext)}`
        )
        return
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '소셜 로그인 처리 중 오류가 발생했습니다.'
      router.push(
        `/auth/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(safeNext)}`
      )
    } finally {
      setLoadingProvider('')
    }
  }

  const title = mode === 'signup' ? '소셜로 시작하기' : '소셜 로그인'
  const description =
    mode === 'signup'
      ? '구글, 네이버, 카카오로 빠르게 가입을 시작할 수 있습니다.'
      : '구글, 네이버, 카카오 계정으로 바로 로그인할 수 있습니다.'

  return (
    <div style={{ display: 'grid', gap: mobile ? 8 : 10 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <div
          style={{
            fontSize: mobile ? 12 : 13,
            color: '#8a7357',
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          {title.toUpperCase()}
        </div>
        <p
          style={{
            margin: 0,
            color: '#7c6955',
            fontSize: mobile ? 13 : 14,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => handleOAuthLogin('google')}
        disabled={!!loadingProvider}
        style={{
          ...socialButtonStyle,
          height: mobile ? 50 : 54,
          background: '#ffffff',
          color: '#241b11',
          border: '1px solid #d9d2c7',
          fontSize: mobile ? 14 : 15,
        }}
      >
        <span style={iconStyle}>G</span>
        <span>{loadingProvider === 'google' ? '이동 중...' : 'Google로 계속하기'}</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthLogin('custom:naver')}
        disabled={!!loadingProvider}
        style={{
          ...socialButtonStyle,
          height: mobile ? 50 : 54,
          background: '#03c75a',
          color: '#ffffff',
          border: '1px solid #03c75a',
          fontSize: mobile ? 14 : 15,
        }}
      >
        <span style={iconStyle}>N</span>
        <span>{loadingProvider === 'custom:naver' ? '이동 중...' : '네이버로 계속하기'}</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthLogin('kakao')}
        disabled={!!loadingProvider}
        style={{
          ...socialButtonStyle,
          height: mobile ? 50 : 54,
          background: '#fee500',
          color: '#241b11',
          border: '1px solid #e8cf00',
          fontSize: mobile ? 14 : 15,
        }}
      >
        <span style={iconStyle}>K</span>
        <span>{loadingProvider === 'kakao' ? '이동 중...' : '카카오로 계속하기'}</span>
      </button>
    </div>
  )
}

const socialButtonStyle: React.CSSProperties = {
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontWeight: 800,
  cursor: 'pointer',
  width: '100%',
}

const iconStyle: React.CSSProperties = {
  width: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  flexShrink: 0,
}