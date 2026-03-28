import type { ReactNode } from "react";

export default function MobileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="msell-mobile-layout">
      <div className="msell-mobile-layout__inner">{children}</div>

      <style>{`
        .msell-mobile-layout {
          width: 100%;
          min-height: 100dvh;
          background: #f6f1e7;
        }

        .msell-mobile-layout__inner {
          width: 100%;
          min-height: 100dvh;
          padding-bottom: calc(108px + env(safe-area-inset-bottom));
          box-sizing: border-box;
        }

        @media (max-width: 380px) {
          .msell-mobile-layout__inner {
            padding-bottom: calc(102px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}