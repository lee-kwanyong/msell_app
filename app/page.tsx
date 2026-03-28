import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  view_count?: number | null;
};

function formatPrice(value: number | string | null | undefined) {
  const price =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(price)) return "-";
  return `₩ ${price.toLocaleString("ko-KR")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function statusLabel(status?: string | null) {
  const value = (status || "").toLowerCase();

  const map: Record<string, string> = {
    active: "거래가능",
    draft: "임시저장",
    hidden: "숨김",
    sold: "거래종료",
    reserved: "예약중",
    pending_review: "검토중",
    rejected: "반려",
    archived: "보관",
  };

  return map[value] || status || "-";
}

function statusTone(status?: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "active") {
    return {
      background: "#e8f6ea",
      color: "#3f8a53",
    };
  }

  if (value === "sold") {
    return {
      background: "#f2e8db",
      color: "#7f684f",
    };
  }

  if (value === "reserved") {
    return {
      background: "#fff3d8",
      color: "#9a6b10",
    };
  }

  return {
    background: "#f2e8db",
    color: "#7f684f",
  };
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const [
    latestListingsResult,
    totalListingsResult,
    activeListingsResult,
    soldListingsResult,
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "sold"),
  ]);

  const latestListings = (latestListingsResult.data ?? []) as ListingRow[];
  const totalListings = totalListingsResult.count ?? 0;
  const activeListings = activeListingsResult.count ?? 0;
  const soldListings = soldListingsResult.count ?? 0;

  const recentAmountSeries = latestListings
    .slice(0, 7)
    .map((item) => {
      const raw =
        typeof item.price === "number"
          ? item.price
          : typeof item.price === "string"
            ? Number(item.price)
            : 0;

      return {
        date: formatDate(item.created_at),
        value: Number.isFinite(raw) ? raw : 0,
      };
    })
    .reverse();

  const maxAmount =
    recentAmountSeries.length > 0
      ? Math.max(...recentAmountSeries.map((item) => item.value), 1)
      : 1;

  return (
    <main className="home-page">
      <style>{`
        .home-page {
          min-height: 100vh;
          background: #f6f1e7;
          padding: 24px 20px 120px;
        }

        .home-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .home-top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(340px, 0.95fr);
          gap: 18px;
          align-items: stretch;
        }

        .hero-card {
          position: relative;
          overflow: hidden;
          border-radius: 36px;
          padding: 42px 36px 34px;
          min-height: 440px;
          background:
            radial-gradient(circle at top right, rgba(137,95,54,0.16), transparent 26%),
            linear-gradient(135deg, #fffdf9 0%, #f7f0e6 52%, #efe2cf 100%);
          border: 1px solid #eadfce;
          box-shadow: 0 24px 60px rgba(61, 41, 22, 0.08);
        }

        .hero-glow {
          position: absolute;
          top: -60px;
          right: -30px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(112,72,37,0.15) 0%, rgba(112,72,37,0.04) 45%, transparent 72%);
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 760px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          background: #f3e7d6;
          color: #7b6248;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          margin-bottom: 22px;
        }

        .hero-title {
          margin: 0;
          color: #17110c;
          font-size: 64px;
          line-height: 1.02;
          letter-spacing: -0.035em;
          font-weight: 900;
          word-break: keep-all;
        }

        .hero-title span {
          display: block;
        }

        .hero-title .hero-title-accent {
          margin-top: 8px;
          background: linear-gradient(180deg, #17110c 0%, #332318 60%, #6c4526 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-copy {
          margin: 26px 0 0;
          max-width: 620px;
          color: #6e5944;
          font-size: 18px;
          line-height: 1.8;
          font-weight: 650;
          word-break: keep-all;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .primary-btn,
        .secondary-btn,
        .ghost-btn {
          height: 52px;
          padding: 0 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          white-space: nowrap;
        }

        .primary-btn {
          background: #2f2417;
          color: #fffaf2;
          box-shadow: 0 12px 24px rgba(47, 36, 23, 0.18);
        }

        .secondary-btn {
          background: #fffdf9;
          border: 1px solid #e2d4c2;
          color: #2f2417;
        }

        .hero-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
          max-width: 560px;
        }

        .hero-point {
          border-radius: 20px;
          padding: 14px 14px 12px;
          background: rgba(255,253,249,0.76);
          border: 1px solid #eadfce;
          backdrop-filter: blur(8px);
        }

        .hero-point-title {
          color: #1e1610;
          font-size: 15px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .hero-point-copy {
          color: #7a6651;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.55;
        }

        .panel-card {
          border-radius: 32px;
          background: #fbf7f1;
          border: 1px solid #eadfce;
          padding: 20px;
          box-shadow: 0 20px 44px rgba(61, 41, 22, 0.06);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
        }

        .panel-eyebrow {
          color: #a58a6d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          margin-bottom: 6px;
        }

        .panel-title {
          color: #16110d;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .pill-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          background: #f2e8db;
          color: #7f684f;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .amount-box {
          flex: 1;
          min-height: 250px;
          border-radius: 26px;
          border: 1px solid #eadfce;
          background: #fffdf9;
          padding: 24px 18px 16px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          min-width: 0;
          overflow: hidden;
        }

        .amount-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8a7156;
          font-size: 14px;
          font-weight: 700;
        }

        .amount-bar-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .amount-bar {
          width: 100%;
          max-width: 44px;
          border-radius: 999px;
          background: linear-gradient(180deg, #d0a879 0%, #a16e3d 48%, #744a26 100%);
          box-shadow: 0 12px 20px rgba(110, 73, 37, 0.14);
        }

        .amount-date {
          color: #8a7156;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .home-mid-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 18px;
          margin-top: 18px;
        }

        .snapshot-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .snapshot-item,
        .flow-item,
        .listing-card {
          min-width: 0;
        }

        .snapshot-item {
          border-radius: 24px;
          background: #fffdf9;
          border: 1px solid #eadfce;
          padding: 18px 18px 16px;
        }

        .snapshot-label {
          color: #9a846d;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .snapshot-value {
          color: #16110d;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .flow-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .flow-item {
          border-radius: 20px;
          background: #fffdf9;
          border: 1px solid #eadfce;
          padding: 18px 16px 16px;
        }

        .flow-no {
          color: #a58a6d;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .flow-label {
          color: #16110d;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.4;
          word-break: keep-all;
        }

        .listing-section {
          margin-top: 24px;
        }

        .listing-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .listing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .listing-link {
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }

        .listing-card {
          border-radius: 28px;
          background: #fbf7f1;
          border: 1px solid #eadfce;
          padding: 20px;
          box-shadow: 0 16px 34px rgba(61, 41, 22, 0.06);
          min-height: 220px;
        }

        .listing-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }

        .listing-title {
          color: #16110d;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 1.08;
          margin-bottom: 18px;
          min-height: 66px;
          word-break: keep-all;
        }

        .listing-price {
          color: #1f1510;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }

        .listing-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          color: #8a7156;
          font-size: 12px;
          font-weight: 800;
        }

        .listing-empty {
          border-radius: 30px;
          background: #fbf7f1;
          border: 1px solid #eadfce;
          padding: 40px 24px;
          text-align: center;
          box-shadow: 0 16px 34px rgba(61, 41, 22, 0.06);
        }

        .listing-empty-title {
          color: #16110d;
          font-size: 22px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        @media (max-width: 1024px) {
          .home-top-grid {
            grid-template-columns: 1fr;
          }

          .home-mid-grid {
            grid-template-columns: 1fr;
          }

          .listing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-title {
            font-size: 56px;
          }
        }

        @media (max-width: 768px) {
          .home-page {
            padding: 18px 12px 120px;
          }

          .hero-card,
          .panel-card {
            border-radius: 28px;
          }

          .hero-card {
            min-height: auto;
            padding: 28px 20px 22px;
          }

          .hero-title {
            font-size: 38px;
            line-height: 1.08;
            letter-spacing: -0.03em;
          }

          .hero-title .hero-title-accent {
            margin-top: 4px;
          }

          .hero-copy {
            margin-top: 18px;
            font-size: 15px;
            line-height: 1.75;
          }

          .hero-actions {
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            padding: 0 14px;
            font-size: 14px;
          }

          .hero-points {
            grid-template-columns: 1fr;
            max-width: none;
            margin-top: 18px;
          }

          .panel-card {
            padding: 16px;
          }

          .panel-title {
            font-size: 18px;
          }

          .amount-box {
            min-height: 200px;
            padding: 18px 12px 12px;
            gap: 8px;
          }

          .amount-bar {
            max-width: 28px;
          }

          .amount-date {
            font-size: 10px;
          }

          .snapshot-grid {
            grid-template-columns: 1fr;
          }

          .flow-grid {
            grid-template-columns: 1fr 1fr;
          }

          .listing-grid {
            grid-template-columns: 1fr;
          }

          .listing-title {
            font-size: 24px;
            min-height: auto;
            margin-bottom: 14px;
          }

          .listing-price {
            font-size: 18px;
          }

          .listing-meta {
            font-size: 11px;
          }
        }
      `}</style>

      <div className="home-shell">
        <div className="home-top-grid">
          <section className="hero-card">
            <div className="hero-glow" />

            <div className="hero-inner">
              <div className="eyebrow">MSELL</div>

              <h1 className="hero-title">
                <span>디지털 자산</span>
                <span className="hero-title-accent">마켓플레이스</span>
              </h1>

              <p className="hero-copy">
                계정, 채널, 도메인, 웹사이트, 디지털 상품까지.
                <br />
                등록부터 문의, 협의, 이전까지 한 흐름으로 연결되는 거래 공간.
              </p>

              <div className="hero-actions">
                <Link href="/listings" className="primary-btn">
                  거래목록 보기
                </Link>

                <Link href="/listings/create" className="secondary-btn">
                  자산 등록하기
                </Link>
              </div>

              <div className="hero-points">
                {[
                  ["빠른 등록", "핵심 정보 중심"],
                  ["안전한 문의", "딜룸 연결"],
                  ["명확한 이전", "절차 가시화"],
                ].map(([title, desc]) => (
                  <div key={title} className="hero-point">
                    <div className="hero-point-title">{title}</div>
                    <div className="hero-point-copy">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-head">
              <div>
                <div className="panel-eyebrow">AMOUNT TREND</div>
                <div className="panel-title">거래금액 추이</div>
              </div>

              <div className="pill-chip">최근 7건</div>
            </div>

            <div className="amount-box">
              {recentAmountSeries.length === 0 ? (
                <div className="amount-empty">표시할 데이터가 없습니다.</div>
              ) : (
                recentAmountSeries.map((item, index) => {
                  const height = Math.max(42, Math.round((item.value / maxAmount) * 150));

                  return (
                    <div key={`${item.date}-${index}`} className="amount-bar-col">
                      <div className="amount-bar" style={{ height }} />
                      <div className="amount-date">{item.date}</div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="home-mid-grid">
          <section className="panel-card">
            <div className="panel-eyebrow">LIVE SNAPSHOT</div>

            <div className="snapshot-grid">
              {[
                ["현재 공개 자산", String(activeListings)],
                ["누적 등록 수", String(totalListings)],
                ["거래 종료 수", String(soldListings)],
              ].map(([label, value]) => (
                <div key={label} className="snapshot-item">
                  <div className="snapshot-label">{label}</div>
                  <div className="snapshot-value">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-eyebrow">TRADE FLOW</div>
            <div className="panel-title" style={{ marginBottom: 16 }}>
              거래 진행 4단계
            </div>

            <div className="flow-grid">
              {[
                ["01", "매물 확인"],
                ["02", "거래 문의"],
                ["03", "조건 협의"],
                ["04", "이전 완료"],
              ].map(([no, label]) => (
                <div key={no} className="flow-item">
                  <div className="flow-no">{no}</div>
                  <div className="flow-label">{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="listing-section">
          <div className="listing-head">
            <div>
              <div className="panel-eyebrow" style={{ marginBottom: 6 }}>
                LIVE LISTINGS
              </div>
              <div className="panel-title" style={{ fontSize: 28 }}>
                최신 등록 자산
              </div>
            </div>

            <Link href="/listings" className="secondary-btn" style={{ height: 42 }}>
              전체 자산 보기
            </Link>
          </div>

          {latestListings.length === 0 ? (
            <div className="listing-empty">
              <div className="listing-empty-title">등록된 자산이 없습니다</div>
              <Link href="/listings/create" className="primary-btn" style={{ height: 46 }}>
                자산등록
              </Link>
            </div>
          ) : (
            <div className="listing-grid">
              {latestListings.map((item) => {
                const tone = statusTone(item.status);

                return (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="listing-link"
                  >
                    <article className="listing-card">
                      <div className="listing-top">
                        <span className="pill-chip">{item.category || "기타"}</span>

                        <span
                          className="pill-chip"
                          style={{
                            background: tone.background,
                            color: tone.color,
                          }}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>

                      <div className="listing-title">{item.title || "제목 없음"}</div>

                      <div className="listing-price">{formatPrice(item.price)}</div>

                      <div className="listing-meta">
                        <span>{formatDate(item.created_at)}</span>
                        <span>조회 {item.view_count ?? 0}</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}