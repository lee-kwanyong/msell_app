'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Msell Global Error]', error)
  }, [error])

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: '#f6f1e7',
          color: '#241b11',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#fff',
              border: '1px solid #eadfcf',
              borderRadius: 24,
              padding: '40px 24px',
              boxShadow: '0 12px 32px rgba(47,36,23,0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 90,
                height: 36,
                padding: '0 14px',
                borderRadius: 999,
                background: '#f3eadf',
                color: '#6b5640',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              ERROR
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.25,
                fontWeight: 800,
                color: '#241b11',
              }}
            >
              일시적인 문제가 발생했습니다
            </h1>

            <p
              style={{
                margin: '14px 0 0',
                color: '#6b5640',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              페이지를 불러오는 중 오류가 발생했습니다.
              <br />
              다시 시도하거나 잠시 후 다시 접속해 주세요.
            </p>

            <div
              style={{
                marginTop: 24,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  border: 0,
                  height: 48,
                  padding: '0 18px',
                  borderRadius: 14,
                  background: '#2f2417',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                다시 시도
              </button>

              <a
                href="/listings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 48,
                  padding: '0 18px',
                  borderRadius: 14,
                  background: '#eadfcf',
                  color: '#241b11',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                거래목록으로 이동
              </a>
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <pre
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 16,
                  background: '#faf6ef',
                  border: '1px solid #eadfcf',
                  color: '#7a6248',
                  overflowX: 'auto',
                  textAlign: 'left',
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {error?.message || 'Unknown error'}
              </pre>
            )}
          </div>
        </main>
      </body>
    </html>
  )
}