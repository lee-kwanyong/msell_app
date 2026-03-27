'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type AuthGatewayProps = {
  mode: 'login' | 'signup';
  mobile?: boolean;
  next?: string;
};

const NAVER_PROVIDER =
  process.env.NEXT_PUBLIC_NAVER_SUPABASE_PROVIDER_ID || 'custom:naver';

export default function AuthGateway({
  mode,
  mobile = false,
  next: nextProp,
}: AuthGatewayProps) {
  const supabase = supabaseBrowser();
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  const next = useMemo(() => {
    if (nextProp && typeof nextProp === 'string') return nextProp;

    const value = searchParams.get('next');
    if (!value || typeof value !== 'string') {
      return mobile ? '/m' : '/';
    }

    return value;
  }, [mobile, nextProp, searchParams]);

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL('/auth/callback', window.location.origin);
    url.searchParams.set('next', next);
    return url.toString();
  }, [next]);

  async function handleOAuth(provider: string) {
    try {
      setError('');
      setLoadingProvider(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as never,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setError(error.message || '소셜 로그인 중 오류가 발생했습니다.');
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : '소셜 로그인 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoadingProvider(null);
    }
  }

  const isLogin = mode === 'login';
  const title = isLogin ? '로그인' : '회원가입';
  const description = isLogin
    ? '구글 또는 네이버로 간편하게 로그인하세요.'
    : '구글 또는 네이버로 빠르게 가입하고 시작하세요.';

  const switchHref = mobile
    ? isLogin
      ? '/m/auth/signup'
      : '/m/auth/login'
    : isLogin
      ? '/auth/signup'
      : '/auth/login';

  const switchLabel = isLogin ? '회원가입' : '로그인';

  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gap: 14,
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontSize: mobile ? 24 : 30,
            fontWeight: 800,
            color: '#24170f',
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: mobile ? 14 : 15,
            lineHeight: 1.6,
            color: '#6b5b4d',
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!loadingProvider}
          style={{
            height: mobile ? 52 : 56,
            width: '100%',
            borderRadius: 14,
            border: '1px solid #ddd2c2',
            background: '#ffffff',
            color: '#24170f',
            fontSize: 15,
            fontWeight: 700,
            cursor: loadingProvider ? 'not-allowed' : 'pointer',
            opacity: loadingProvider ? 0.72 : 1,
          }}
        >
          {loadingProvider === 'google'
            ? '구글 로그인 이동 중...'
            : `Google로 ${isLogin ? '로그인' : '시작하기'}`}
        </button>

        <button
          type="button"
          onClick={() => handleOAuth(NAVER_PROVIDER)}
          disabled={!!loadingProvider}
          style={{
            height: mobile ? 52 : 56,
            width: '100%',
            borderRadius: 14,
            border: '1px solid #cfe8cc',
            background: '#03c75a',
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 800,
            cursor: loadingProvider ? 'not-allowed' : 'pointer',
            opacity: loadingProvider ? 0.72 : 1,
          }}
        >
          {loadingProvider === NAVER_PROVIDER
            ? '네이버 로그인 이동 중...'
            : `네이버로 ${isLogin ? '로그인' : '시작하기'}`}
        </button>
      </div>

      {error ? (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid #efc9c2',
            background: '#fff5f3',
            color: '#9a3412',
            padding: '12px 14px',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          borderTop: '1px solid #ece3d6',
          paddingTop: 14,
          fontSize: 14,
          color: '#6b5b4d',
        }}
      >
        {isLogin ? '아직 계정이 없나요? ' : '이미 계정이 있나요? '}
        <Link
          href={switchHref}
          style={{
            color: '#2f2417',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          {switchLabel}
        </Link>
      </div>
    </div>
  );
}