'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Props = {
  next?: string
}

type LoadingType = null | 'google' | 'kakao' | 'naver'

function safeNextPath(input: string | null | undefined) {
  if (!input) return '/'
  if (!input.startsWith('/')) return '/'
  if (input.startsWith('//')) return '/'
  return input
}

export default function AuthGateway({ next = '/' }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [loading, setLoading] = useState<LoadingType>(null)
  const [error, setError] = useState('')

  const naverProvider =
    process.env.NEXT_PUBLIC_NAVER_SUPABASE_PROVIDER_ID?.trim() || 'custom:naver'

  async function signInWithOAuth(type: LoadingType) {
    if (!type) return

    try {
      setError('')
      setLoading(type)

      const safeNext = safeNextPath(next)
      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const provider =
        type === 'google'
          ? 'google'
          : type === 'kakao'
          ? 'kakao'
          : (naverProvider as 'custom:naver')

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        setError(readableOAuthError(error.message, type))
        setLoading(null)
        return
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : '소셜 로그인 중 오류가 발생했습니다.'
      )
      setLoading(null)
    }
  }

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <button
        type="button"
        onClick={() => signInWithOAuth('google')}
        disabled={loading !== null}
        style={socialButtonStyle}
      >
        <span style={logoStyle}>G</span>
        <span>{loading === 'google' ? '구글 연결 중...' : '구글로 로그인'}</span>
      </button>

      <button
        type="button"
        onClick={() => signInWithOAuth('kakao')}
        disabled={loading !== null}
        style={socialButtonStyle}
      >
        <span style={{ ...logoStyle, background: '#FEE500', color: '#191600' }}>K</span>
        <span>{loading === 'kakao' ? '카카오 연결 중...' : '카카오로 로그인'}</span>
      </button>

      <button
        type="button"
        onClick={() => signInWithOAuth('naver')}
        disabled={loading !== null}
        style={socialButtonStyle}
      >
        <span style={{ ...logoStyle, background: '#03C75A', color: '#ffffff' }}>N</span>
        <span>{loading === 'naver' ? '네이버 연결 중...' : '네이버로 로그인'}</span>
      </button>

      {error ? (
        <div
          style={{
            marginTop: 4,
            borderRadius: 14,
            background: '#fff4f2',
            border: '1px solid #f1d0c8',
            color: '#9a3f2d',
            fontSize: 14,
            fontWeight: 700,
            padding: '14px 16px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  )
}

function readableOAuthError(message: string, provider: Exclude<LoadingType, null>) {
  const providerLabel =
    provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버'

  const lower = message.toLowerCase()

  if (lower.includes('provider is not enabled')) {
    return `${providerLabel} 로그인 공급자가 Supabase에서 아직 정상 활성화되지 않았습니다. Supabase Authentication > Providers에서 다시 저장한 뒤 재시도해 주세요.`
  }

  if (lower.includes('custom oauth providers are disabled')) {
    return `네이버 커스텀 공급자 호출이 거부되었습니다. Supabase의 맞춤형 공급업체에서 식별자를 다시 확인하고, NEXT_PUBLIC_NAVER_SUPABASE_PROVIDER_ID 값이 실제 식별자와 같은지 확인해 주세요.`
  }

  if (lower.includes('redirect')) {
    return `${providerLabel} 로그인 리디렉션 설정이 맞지 않습니다. Supabase URL Configuration과 각 개발자 콘솔의 Redirect URI를 다시 확인해 주세요.`
  }

  return message
}

const socialButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 14,
  border: '1px solid #ddcfba',
  background: '#ffffff',
  color: '#241b11',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  justifyContent: 'center',
}

const logoStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 999,
  background: '#f1f1f1',
  color: '#241b11',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 900,
  flexShrink: 0,
}