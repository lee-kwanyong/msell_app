import Link from 'next/link'

export const metadata = {
  title: '오프라인',
}

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f1e7',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          border: '1px solid #eadfcf',
          borderRadius: 24,
          padding: '32px 24px',
          boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 34,
            padding: '0 12px',
            borderRadius: 999,
            background: '#f3eadf',
            color: '#6b5640',
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          OFFLINE
        </div>

        <h1
          style={{
            margin: 0,
            color: '#241b11',
            fontSize: 30,
            lineHeight: 1.25,
            fontWeight: 900,
          }}
        >
          인터넷 연결이 필요합니다
        </h1>

        <p
          style={{
            margin: '14px 0 0',
            color: '#6b5640',
            fontSize: 15,
            lineHeight: 1.75,
          }}
        >
          현재 네트워크 연결이 불안정하거나 끊어져 있습니다.
          <br />
          연결 상태를 확인한 뒤 다시 접속해 주세요.
        </p>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              height: 46,
              padding: '0 18px',
              borderRadius: 14,
              background: '#2f2417',
              color: '#fff',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            홈으로
          </Link>

          <Link
            href="/listings"
            style={{
              height: 46,
              padding: '0 18px',
              borderRadius: 14,
              background: '#eadfcf',
              color: '#241b11',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            거래목록
          </Link>
        </div>
      </div>
    </main>
  )
}