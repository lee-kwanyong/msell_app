'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Props = {
  next?: string
}

type LoadingType = null | 'google' | 'naver'

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

  async function signInWithOAuth(type: LoadingType) {
    if (!type) return

    try {
      setError('')
      setLoading(type)

      const safeNext = safeNextPath(next)
      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const provider = type === 'google' ? 'google' : 'custom:naver'

      const { data, error } = await supabase.auth.signInWithOAuth({
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

      if (!data?.url) {
        setError(
          type === 'google'
            ? '구글 로그인 URL 생성에 실패했습니다.'
            : '네이버 로그인 URL 생성에 실패했습니다.'
        )
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
  const providerLabel = provider === 'google' ? '구글' : '네이버'
  const lower = message.toLowerCase()

  if (lower.includes('provider is not enabled')) {
    return `${providerLabel} 로그인 공급자가 Supabase에서 아직 정상 활성화되지 않았습니다.`
  }

  if (lower.includes('custom oauth providers are disabled')) {
    return `네이버 커스텀 공급자 호출이 거부되었습니다. Supabase의 Custom Provider 설정을 다시 확인해 주세요.`
  }

  if (lower.includes('missing provider id')) {
    return `네이버 공급자 식별자를 찾지 못했습니다. Supabase Custom Provider ID가 custom:naver로 정확히 연결되어 있는지 다시 확인해 주세요.`
  }

  if (lower.includes('redirect')) {
    return `${providerLabel} 로그인 리디렉션 설정이 맞지 않습니다. Supabase와 네이버 개발자센터의 Callback URL을 다시 확인해 주세요.`
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