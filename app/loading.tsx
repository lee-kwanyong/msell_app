export default function Loading() {
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
          maxWidth: 520,
          background: '#ffffff',
          border: '1px solid #eadfcf',
          borderRadius: 24,
          padding: '32px 24px',
          boxShadow: '0 10px 30px rgba(47,36,23,0.06)',
        }}
      >
        <div
          style={{
            width: 120,
            height: 14,
            borderRadius: 999,
            background: '#efe4d4',
            marginBottom: 20,
          }}
        />
        <div
          style={{
            width: '100%',
            height: 18,
            borderRadius: 999,
            background: '#f5ecdf',
            marginBottom: 12,
          }}
        />
        <div
          style={{
            width: '82%',
            height: 18,
            borderRadius: 999,
            background: '#f5ecdf',
            marginBottom: 12,
          }}
        />
        <div
          style={{
            width: '60%',
            height: 18,
            borderRadius: 999,
            background: '#f5ecdf',
            marginBottom: 24,
          }}
        />

        <div
          style={{
            display: 'grid',
            gap: 12,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 72,
                borderRadius: 18,
                background: '#faf6ef',
                border: '1px solid #f0e5d7',
              }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}