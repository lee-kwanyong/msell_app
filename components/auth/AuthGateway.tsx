'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

type Props = {
  mode?: 'login' | 'signup'
  next?: string
  mobile?: boolean
}

export default function AuthGateway({
  mode = 'login',
  next: nextProp,
  mobile = false,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const nextFromQuery = searchParams.get('next') || '/'
  const next = nextProp || nextFromQuery || '/'

  const error = searchParams.get('error') || ''
  const message = searchParams.get('message') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const callbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined

  async function handleSocialLogin(provider: 'google' | 'kakao' | 'custom:naver') {
    try {
      setLocalError('')
      setLoadingProvider(provider)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        setLocalError(error.message)
      }
    } finally {
      setLoadingProvider(null)
    }
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setLocalError('')
      setEmailLoading(true)

      const normalizedEmail = email.trim()

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        setLocalError(error.message)
        return
      }

      router.replace(next)
      router.refresh()
    } finally {
      setEmailLoading(false)
    }
  }

  const radius = mobile ? 24 : 30
  const contentPadding = mobile ? 20 : 28
  const headingSize = mobile ? 28 : 34
  const subTextSize = mobile ? 13 : 14

  return (
    <div
      style={{
        border: '1px solid #e5d9ca',
        background: 'linear-gradient(180deg, #fffdfa 0%, #fcf8f2 100%)',
        borderRadius: radius,
        overflow: 'hidden',
        boxShadow: '0 18px 50px rgba(47,36,23,0.05)',
      }}
    >
      <div
        style={{
          padding: mobile ? '24px 20px 18px' : '28px 28px 20px',
          borderBottom: '1px solid #ece0d2',
          background: 'linear-gradient(180deg, #fcfaf6 0%, #f7f1e8 100%)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: headingSize,
            lineHeight: 1.05,
            color: '#1f1710',
            fontWeight: 900,
            letterSpacing: '-0.04em',
          }}
        >
          {mode === 'signup' ? '회원가입' : '로그인'}
        </h2>

        <p
          style={{
            margin: '12px 0 0',
            color: '#756858',
            fontSize: subTextSize,
            lineHeight: 1.7,
            maxWidth: 520,
          }}
        >
          구글, 카카오, 네이버 또는 이메일로 Msell에 접속할 수 있습니다.
        </p>
      </div>

      <div style={{ padding: contentPadding }}>
        {(error || message || localError) && (
          <div
            style={{
              marginBottom: 18,
              borderRadius: 16,
              border: '1px solid #efcdc8',
              background: '#fff4f2',
              color: '#8a2f25',
              padding: '13px 15px',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {localError || error || message}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loadingProvider !== null}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              border: '1px solid #dfd1bf',
              background: '#fffdfa',
              color: '#221a12',
              fontSize: 14,
              fontWeight: 900,
              cursor: loadingProvider ? 'not-allowed' : 'pointer',
              opacity: loadingProvider && loadingProvider !== 'google' ? 0.6 : 1,
            }}
          >
            {loadingProvider === 'google' ? '이동 중...' : 'Google로 로그인'}
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            disabled={loadingProvider !== null}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              border: '1px solid #e7d96a',
              background: '#FEE500',
              color: '#191600',
              fontSize: 14,
              fontWeight: 900,
              cursor: loadingProvider ? 'not-allowed' : 'pointer',
              opacity: loadingProvider && loadingProvider !== 'kakao' ? 0.6 : 1,
            }}
          >
            {loadingProvider === 'kakao' ? '이동 중...' : '카카오로 로그인'}
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('custom:naver')}
            disabled={loadingProvider !== null}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              border: '1px solid #12b650',
              background: '#03C75A',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 900,
              cursor: loadingProvider ? 'not-allowed' : 'pointer',
              opacity: loadingProvider && loadingProvider !== 'custom:naver' ? 0.6 : 1,
            }}
          >
            {loadingProvider === 'custom:naver' ? '이동 중...' : '네이버로 로그인'}
          </button>
        </div>

        <div
          style={{
            margin: '22px 0 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#8a7a67',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <div style={{ flex: 1, height: 1, background: '#eadfce' }} />
          <span>또는 이메일 로그인</span>
          <div style={{ flex: 1, height: 1, background: '#eadfce' }} />
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                color: '#3f3121',
                fontWeight: 800,
              }}
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                height: 54,
                borderRadius: 16,
                border: '1px solid #dfd1bf',
                background: '#fffdfa',
                padding: '0 16px',
                color: '#221a12',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                color: '#3f3121',
                fontWeight: 800,
              }}
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              style={{
                width: '100%',
                height: 54,
                borderRadius: 16,
                border: '1px solid #dfd1bf',
                background: '#fffdfa',
                padding: '0 16px',
                color: '#221a12',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(180deg, #3a2c1c 0%, #241b11 100%)',
              color: '#fffaf3',
              fontSize: 14,
              fontWeight: 900,
              cursor: emailLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 24px rgba(47,36,23,0.18)',
            }}
          >
            {emailLoading ? '처리 중...' : '이메일로 로그인'}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid #ece0d2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 13, color: '#7d6e5f', fontWeight: 700 }}>
            아직 계정이 없다면
          </div>

          <Link
            href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            style={{
              height: 42,
              padding: '0 16px',
              borderRadius: 14,
              border: '1px solid #e0d4c4',
              background: '#f7efe4',
              color: '#2f2417',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}