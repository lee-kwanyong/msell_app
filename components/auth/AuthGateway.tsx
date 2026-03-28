"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  next?: string;
};

type ProviderKey = "google" | "kakao" | "naver";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.9 14.7 2 12 2 6.9 2 2.8 6.2 2.8 11.3S6.9 20.6 12 20.6c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.8-.1-1.1H12Z"
      />
      <path
        fill="#34A853"
        d="M2.8 11.3c0 1.6.4 3.1 1.2 4.4l3.6-2.8c-.2-.5-.3-1-.3-1.6s.1-1.1.3-1.6L4 6.9c-.8 1.3-1.2 2.8-1.2 4.4Z"
      />
      <path
        fill="#FBBC05"
        d="M12 20.6c2.7 0 4.9-.9 6.5-2.5l-3.2-2.6c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.5-4l-3.7 2.8c1.6 3.2 4.9 5.3 9.2 5.3Z"
      />
      <path
        fill="#4285F4"
        d="M18.5 18.1c1.9-1.8 2.7-4.3 2.7-6.8 0-.5 0-.8-.1-1.1H12v3.9h5.5c-.3 1.4-1.1 2.9-2.8 4l3.8 3Z"
      />
    </svg>
  );
}

function KakaoLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#3A1D1D"
        d="M12 3C6.48 3 2 6.44 2 10.67c0 2.72 1.84 5.1 4.61 6.44l-1.12 4.09c-.1.36.3.65.62.45l4.83-3.19c.68.09 1.37.14 2.06.14 5.52 0 10-3.44 10-7.67S17.52 3 12 3Z"
      />
    </svg>
  );
}

function NaverLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FFFFFF"
        d="M16.9 12.7 7.9 0H0v24h7.1V11.3l9 12.7H24V0h-7.1v12.7Z"
      />
    </svg>
  );
}

const SOCIAL_META: Record<
  ProviderKey,
  {
    label: string;
    background: string;
    color: string;
    border: string;
    logo: JSX.Element;
  }
> = {
  google: {
    label: "구글로 계속하기",
    background: "#ffffff",
    color: "#1f140c",
    border: "1px solid #e5ddd2",
    logo: <GoogleLogo />,
  },
  kakao: {
    label: "카카오로 계속하기",
    background: "#FEE500",
    color: "#3A1D1D",
    border: "1px solid #e8d238",
    logo: <KakaoLogo />,
  },
  naver: {
    label: "네이버로 계속하기",
    background: "#03C75A",
    color: "#ffffff",
    border: "1px solid #03C75A",
    logo: <NaverLogo />,
  },
};

export default function AuthGateway({ next = "/account" }: Props) {
  const [pending, setPending] = useState<ProviderKey | null>(null);
  const [error, setError] = useState("");

  async function signIn(providerKey: ProviderKey) {
    try {
      setPending(providerKey);
      setError("");

      const supabase = supabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

      const provider =
        providerKey === "naver"
          ? ("custom:naver" as any)
          : (providerKey as any);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        setError(error.message || "소셜 로그인 중 오류가 발생했습니다.");
        setPending(null);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "소셜 로그인 중 오류가 발생했습니다."
      );
      setPending(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {error ? (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #efc7c7",
            background: "#fff5f5",
            color: "#8b2e2e",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      {(Object.keys(SOCIAL_META) as ProviderKey[]).map((providerKey) => {
        const meta = SOCIAL_META[providerKey];
        const isLoading = pending === providerKey;

        return (
          <button
            key={providerKey}
            type="button"
            onClick={() => signIn(providerKey)}
            disabled={pending !== null}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 16,
              border: meta.border,
              background: meta.background,
              color: meta.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 900,
              cursor: pending !== null ? "default" : "pointer",
              opacity: pending !== null && !isLoading ? 0.6 : 1,
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {meta.logo}
            </span>
            <span>{isLoading ? "이동 중..." : meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}