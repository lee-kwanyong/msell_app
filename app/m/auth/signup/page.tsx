import AuthGateway from '@/components/auth/AuthGateway';

export const dynamic = 'force-dynamic';

export default function MobileSignupPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#f6f1e7',
        padding: '24px 16px 40px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 auto',
          paddingTop: 24,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            background: '#ffffff',
            border: '1px solid #e9dfd0',
            boxShadow: '0 20px 60px rgba(47, 36, 23, 0.08)',
            padding: 20,
          }}
        >
          <AuthGateway mode="signup" mobile />
        </div>
      </div>
    </main>
  );
}