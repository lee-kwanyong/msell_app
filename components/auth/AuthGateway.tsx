'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type AuthGatewayProps = {
  mode?: 'login' | 'signup';
  next?: string;
  mobile?: boolean;
};

export default function AuthGateway({
  mode = 'login',
  next = '/',
  mobile = false,
}: AuthGatewayProps) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const error =
    searchParams.get('error_description') ||
    searchParams.get('error') ||
    '';

  const nextPath = searchParams.get('next') || next || '/';

  async function handleOAuth(provider: 'google' | 'custom:naver') {
    try {
      setLoadingProvider(provider);

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'select_account',
                }
              : undefined,
        },
      });

      if (error) {
        const path = mode === 'signup' ? '/auth/signup' : '/auth/login';
        window.location.href = `${path}?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`;
        return;
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : '소셜 로그인 중 오류가 발생했습니다.';
      const path = mode === 'signup' ? '/auth/signup' : '/auth/login';
      window.location.href = `${path}?error=${encodeURIComponent(message)}&next=${encodeURIComponent(nextPath)}`;
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: mobile ? 10 : 12,
      }}
    >
      {error ? (
        <div
          style={{
            padding: mobile ? '12px 14px' : '14px 16px',
            borderRadius: 16,
            border: '1px solid #efc2ba',
            background: '#fff4f2',
            color: '#9a3d2f',
            fontSize: mobile ? 13 : 14,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={!!loadingProvider}
        style={{
          ...buttonStyle,
          height: mobile ? 50 : 54,
          background: '#ffffff',
          color: '#2f2417',
          border: '1px solid #ddcfbb',
          fontSize: mobile ? 14 : 15,
        }}
      >
        <span style={iconWrapStyle}>G</span>
        <span>
          {loadingProvider === 'google'
            ? '구글 연결 중...'
            : mode === 'signup'
              ? '구글로 회원가입'
              : '구글로 로그인'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth('custom:naver')}
        disabled={!!loadingProvider}
        style={{
          ...buttonStyle,
          height: mobile ? 50 : 54,
          background: '#03c75a',
          color: '#ffffff',
          border: '1px solid #03c75a',
          fontSize: mobile ? 14 : 15,
        }}
      >
        <span
          style={{
            ...iconWrapStyle,
            background: 'rgba(255,255,255,0.16)',
            color: '#ffffff',
          }}
        >
          N
        </span>
        <span>
          {loadingProvider === 'custom:naver'
            ? '네이버 연결 중...'
            : mode === 'signup'
              ? '네이버로 회원가입'
              : '네이버로 로그인'}
        </span>
      </button>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 16,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontWeight: 800,
  cursor: 'pointer',
};

const iconWrapStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f3ede3',
  color: '#2f2417',
  fontSize: 13,
  fontWeight: 900,
  flexShrink: 0,
};