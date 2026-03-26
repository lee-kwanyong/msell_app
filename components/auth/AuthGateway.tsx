'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

type AuthGatewayProps = {
  next?: string
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

export default function AuthGateway({ next }: AuthGatewayProps) {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const [loadingProvider, setLoadingProvider] = useState<string>('')

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`
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
        router.push(`/auth/login?error=${encodeURIComponent(error.message || `${providerLabel(provider)} 로그인에 실패했습니다.`)}&next=${encodeURIComponent(safeNextPath(next))}`)
        return
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '소셜 로그인 처리 중 오류가 발생했습니다.'
      router.push(`/auth/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(safeNextPath(next))}`)
    } finally {
      setLoadingProvider('')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button
        type="button"
        onClick={() => handleOAuthLogin('google')}
        disabled={!!loadingProvider}
        style={{
          ...socialButtonStyle,
          background: '#ffffff',
          color: '#241b11',
          border: '1px solid #d9d2c7',
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
          background: '#03c75a',
          color: '#ffffff',
          border: '1px solid #03c75a',
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
          background: '#fee500',
          color: '#241b11',
          border: '1px solid #e8cf00',
        }}
      >
        <span style={iconStyle}>K</span>
        <span>{loadingProvider === 'kakao' ? '이동 중...' : '카카오로 계속하기'}</span>
      </button>
    </div>
  )
}

const socialButtonStyle: React.CSSProperties = {
  height: 54,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontSize: 15,
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