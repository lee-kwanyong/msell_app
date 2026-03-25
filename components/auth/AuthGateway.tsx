'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Props = {
  next?: string
}

type LoadingType = null | 'google' | 'kakao' | 'naver'

export default function AuthGateway({ next = '/' }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [loading, setLoading] = useState<LoadingType>(null)
  const [error, setError] = useState('')

  async function signInWithOAuth(provider: 'google' | 'kakao' | 'custom:naver') {
    try {
      setError('')

      const mapped =
        provider === 'google'
          ? 'google'
          : provider === 'kakao'
          ? 'kakao'
          : 'naver'

      setLoading(mapped as LoadingType)

      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '소셜 로그인 중 오류가 발생했습니다.')
    } finally {
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
        onClick={() => signInWithOAuth('custom:naver')}
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