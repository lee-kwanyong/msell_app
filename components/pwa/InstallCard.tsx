"use client";

import { useEffect, useState } from "react";

type DeferredPrompt = Event & {
  prompt?: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIos(ios);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as DeferredPrompt);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt?.prompt) return;
    await deferredPrompt.prompt();
    if (deferredPrompt.userChoice) {
      await deferredPrompt.userChoice;
    }
    setDeferredPrompt(null);
  };

  return (
    <div style={wrap}>
      <div style={iconBox}>M</div>

      <div style={mainRow}>
        <div style={textWrap}>
          <div style={label}>APP INSTALL</div>
          <div style={title}>Msell 앱처럼 바로 실행하세요</div>
          <div style={desc}>
            홈 화면에 추가하면 더 빠르게 접속할 수 있고, 앱처럼 깔끔하게 사용할
            수 있습니다.
          </div>
        </div>

        <div style={actionWrap}>
          {installed ? (
            <div style={installedText}>설치 완료</div>
          ) : deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              className="msell-dark-pill"
              style={installButton}
            >
              앱 설치하기
            </button>
          ) : isIos ? (
            <div style={helperInline}>
              Safari 공유 버튼 → <strong>홈 화면에 추가</strong>
            </div>
          ) : (
            <div style={helperInline}>
              브라우저 메뉴에서 <strong>설치</strong> 또는{" "}
              <strong>홈 화면에 추가</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  display: "flex",
  gap: 18,
  alignItems: "center",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,241,231,0.98))",
  border: "1px solid #eadfcf",
  borderRadius: 28,
  padding: "22px 22px",
  boxShadow: "0 18px 40px rgba(47,36,23,0.08)",
};

const iconBox: React.CSSProperties = {
  width: 64,
  height: 64,
  minWidth: 64,
  borderRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#2f2417",
  color: "#f6f1e7",
  fontSize: 28,
  fontWeight: 900,
  boxShadow: "0 14px 30px rgba(47,36,23,0.18)",
};

const mainRow: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  flexWrap: "nowrap",
};

const textWrap: React.CSSProperties = {
  minWidth: 0,
  flex: 1,
};

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "#8a6f4d",
  marginBottom: 6,
};

const title: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#2f2417",
};

const desc: React.CSSProperties = {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 1.75,
  color: "#665540",
};

const actionWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexShrink: 0,
};

const installButton: React.CSSProperties = {
  border: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "12px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.18s ease",
};

const helperInline: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: "#725c43",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const installedText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#2f2417",
  whiteSpace: "nowrap",
};