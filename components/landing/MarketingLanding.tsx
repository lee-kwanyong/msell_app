import Link from "next/link";

export default function MarketingLanding() {
  return (
    <div>
      {/* HERO */}
      <section style={{ padding: "92px 0 44px" }}>
        <div className="apple-container">
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              color: "var(--apple-subtext)",
            }}
          >
            MSELL
          </div>

          <h1 className="apple-hero" style={{ marginTop: 14, maxWidth: 900 }}>
            Trust-first M&amp;A,
            <br />
            built for speed.
          </h1>

          <p className="apple-p" style={{ marginTop: 18, maxWidth: 720 }}>
            검증된 매물, NDA 기반 정보 공개, 데이터룸·딜룸 워크플로우로 실사 시간을 줄이고 거래 신뢰도를
            높입니다.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <Link href="/listings" className="apple-btn apple-btn-primary">
              Explore listings <span style={{ opacity: 0.75 }}>›</span>
            </Link>
            <Link href="/signup" className="apple-btn">
              Create account <span style={{ opacity: 0.75 }}>›</span>
            </Link>
          </div>

          {/* Visual block */}
          <div
            className="apple-card"
            style={{
              marginTop: 30,
              borderRadius: 28,
              overflow: "hidden",
              padding: 22,
              background: "linear-gradient(180deg, #ffffff, #f6f6f8)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
              <div style={{ gridColumn: "span 6" }}>
                <div style={{ fontSize: 12, color: "var(--apple-subtext)", letterSpacing: "0.14em" }}>
                  OVERVIEW
                </div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 650, letterSpacing: "-0.01em" }}>
                  Listing → NDA → Data room → Deal room
                </div>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: "var(--apple-subtext)" }}>
                  전체 플로우를 한 제품처럼 매끈하게 연결합니다.
                </div>
              </div>

              <div style={{ gridColumn: "span 6" }}>
                <div
                  style={{
                    border: "1px solid var(--apple-border)",
                    borderRadius: 22,
                    padding: 16,
                    background: "rgba(255,255,255,0.7)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--apple-subtext)" }}>Live preview</div>
                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {[
                      ["Verified listings", "KPI + docs"],
                      ["NDA gating", "approve to unlock"],
                      ["Data room", "structured files"],
                      ["Deal room", "stage workflow"],
                    ].map(([k, v], i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: i === 3 ? "none" : "1px solid var(--apple-border)",
                          paddingBottom: i === 3 ? 0 : 10,
                        }}
                      >
                        <div style={{ fontSize: 14 }}>{k}</div>
                        <div style={{ fontSize: 13, color: "var(--apple-subtext)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, color: "var(--apple-subtext)" }}>
            <Link href="/listings" style={{ textDecoration: "underline" }}>
              View verified listings
            </Link>{" "}
            <span>•</span>{" "}
            <Link href="/signup" style={{ textDecoration: "underline" }}>
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "84px 0", borderTop: "1px solid var(--apple-border)" }}>
        <div className="apple-container">
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--apple-subtext)" }}>FEATURES</div>
          <h2 className="apple-h2" style={{ marginTop: 10 }}>
            A marketplace designed for trust.
          </h2>
          <p className="apple-p" style={{ marginTop: 14, maxWidth: 680 }}>
            애플처럼 “설명은 간단하게, 경험은 매끈하게”. 필요한 것만 남기고 전부 정리합니다.
          </p>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
            {[
              ["Verified listings", "핵심 지표·증빙 기반으로 검증된 매물만 우선 노출."],
              ["NDA gating", "민감 정보는 NDA 승인 이후에만 열람."],
              ["Data room", "문서·증빙을 구조화해 실사 속도를 올립니다."],
              ["Deal room", "오퍼→실사→계약 단계를 한 화면에서 관리."],
            ].map(([t, d], i) => (
              <div
                key={i}
                className="apple-card"
                style={{
                  gridColumn: "span 6",
                  padding: 18,
                  borderRadius: 20,
                  background: "linear-gradient(180deg, #fff, #fbfbfc)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-0.01em" }}>{t}</div>
                <div style={{ marginTop: 8, fontSize: 15, color: "var(--apple-subtext)", lineHeight: 1.55 }}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}