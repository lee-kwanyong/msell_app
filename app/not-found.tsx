import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f1e7',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#ffffff',
          border: '1px solid #eadfcf',
          borderRadius: 24,
          padding: '40px 24px',
          boxShadow: '0 10px 30px rgba(47,36,23,0.06)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 72,
            height: 36,
            padding: '0 14px',
            borderRadius: 999,
            background: '#f3eadf',
            color: '#6b5640',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: 0,
            color: '#241b11',
            fontSize: 32,
            lineHeight: 1.25,
            fontWeight: 800,
          }}
        >
          페이지를 찾을 수 없습니다
        </h1>

        <p
          style={{
            margin: '14px 0 0',
            color: '#6b5640',
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          요청하신 주소가 변경되었거나 삭제되었을 수 있습니다.
          <br />
          거래목록으로 돌아가서 다시 확인해 주세요.
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
          <Link
            href="/"
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
            홈으로
          </Link>

          <Link
            href="/listings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 18px',
              borderRadius: 14,
              background: '#2f2417',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            거래목록 보기
          </Link>
        </div>
      </div>
    </main>
  )
}