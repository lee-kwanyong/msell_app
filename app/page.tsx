import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import VisitorTracker from "@/components/analytics/VisitorTracker";

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));

  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat("ko-KR").format(numeric) + "원";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const [{ data: latestListings }, { data: siteStats }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, category, price, status, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("site_stats")
      .select("total_visitors")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const listings = (latestListings as ListingRow[] | null) ?? [];
  const totalVisitors = Number(siteStats?.total_visitors ?? 0);

  return (
    <>
      <VisitorTracker />

      <main className="msell-home">
        <section className="msell-home-hero">
          <div className="msell-home-hero-copy">
            <p className="msell-home-eyebrow">PRIVATE DIGITAL ASSET MARKET</p>
            <h1 className="msell-home-title">
              복잡한 디지털 자산 거래를 위한 프라이빗 마켓
            </h1>
            <p className="msell-home-subtitle">
              공개 노출이 부담스럽고 조건 조율이 중요한 거래를 위해,
              매칭부터 협의까지 더 정제된 흐름을 제공합니다.
            </p>

            <div className="msell-home-actions">
              <Link href="/listings" className="msell-home-btn msell-home-btn-primary">
                거래목록 보기
              </Link>
              <Link href="/listings/create" className="msell-home-btn msell-home-btn-secondary">
                자산 등록하기
              </Link>
            </div>
          </div>

          <div className="msell-home-chart-card">
            <div className="msell-home-chart-head">
              <span>TRADE FLOW</span>
              <strong>거래금액 추이</strong>
            </div>

            <div className="msell-home-chart-body">
              <div className="msell-home-chart-grid" />
              <svg
                viewBox="0 0 420 220"
                className="msell-home-chart-svg"
                aria-hidden="true"
              >
                <path
                  d="M20 176 C70 168, 86 118, 132 126 C176 134, 194 74, 240 82 C286 90, 316 34, 398 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="msell-home-snapshot">
          <div className="msell-home-snapshot-head">
            <span>LIVE SNAPSHOT</span>
          </div>

          <div className="msell-home-kpis">
            <article className="msell-home-kpi">
              <span className="msell-home-kpi-label">누적 방문자</span>
              <strong className="msell-home-kpi-value">
                {formatCompactNumber(totalVisitors)}
              </strong>
            </article>

            <article className="msell-home-kpi">
              <span className="msell-home-kpi-label">공개 자산</span>
              <strong className="msell-home-kpi-value">
                {formatCompactNumber(listings.length)}
              </strong>
            </article>

            <article className="msell-home-kpi">
              <span className="msell-home-kpi-label">거래 상태</span>
              <strong className="msell-home-kpi-value">운영중</strong>
            </article>

            <article className="msell-home-kpi">
              <span className="msell-home-kpi-label">협의 방식</span>
              <strong className="msell-home-kpi-value">1:1 딜룸</strong>
            </article>
          </div>
        </section>

        <section className="msell-home-latest">
          <div className="msell-home-section-head">
            <div>
              <p className="msell-home-section-eyebrow">LATEST LISTINGS</p>
              <h2>최신 등록 자산</h2>
            </div>
            <Link href="/listings" className="msell-home-more">
              전체 보기
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="msell-home-empty">등록된 자산이 없습니다.</div>
          ) : (
            <div className="msell-home-listings">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="msell-home-listing-card"
                >
                  <div className="msell-home-listing-top">
                    <span className="msell-home-listing-badge">
                      {item.category || "기타"}
                    </span>
                    <span className="msell-home-listing-status">
                      {item.status || "-"}
                    </span>
                  </div>

                  <strong className="msell-home-listing-title">
                    {item.title || "제목 없음"}
                  </strong>

                  <div className="msell-home-listing-price">
                    {formatPrice(item.price)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .msell-home {
          width: 100%;
          min-height: calc(100dvh - 120px);
          padding: 28px 16px 120px;
          background: #f6f1e7;
          box-sizing: border-box;
        }

        .msell-home-hero,
        .msell-home-snapshot,
        .msell-home-latest {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }

        .msell-home-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(360px, 460px);
          gap: 20px;
          align-items: stretch;
        }

        .msell-home-hero-copy,
        .msell-home-chart-card,
        .msell-home-snapshot,
        .msell-home-latest {
          border: 1px solid #e5d8c8;
          background: rgba(255, 252, 247, 0.82);
          box-shadow: 0 18px 40px rgba(47, 36, 23, 0.05);
          border-radius: 32px;
        }

        .msell-home-hero-copy {
          padding: 30px;
        }

        .msell-home-eyebrow,
        .msell-home-section-eyebrow,
        .msell-home-snapshot-head span {
          margin: 0 0 12px;
          color: #9a7a57;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .msell-home-title {
          margin: 0;
          color: #1f140c;
          font-size: clamp(38px, 5vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.05em;
          font-weight: 900;
        }

        .msell-home-subtitle {
          margin: 18px 0 0;
          max-width: 700px;
          color: #8d7458;
          font-size: 17px;
          line-height: 1.7;
          font-weight: 700;
        }

        .msell-home-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .msell-home-btn {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .msell-home-btn:hover {
          transform: translateY(-1px);
        }

        .msell-home-btn-primary {
          background: #2f1d10;
          color: #fff;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.16);
        }

        .msell-home-btn-secondary {
          background: #efe4d4;
          color: #2f1d10;
          border: 1px solid #e2d1ba;
        }

        .msell-home-chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .msell-home-chart-head {
          display: grid;
          gap: 6px;
        }

        .msell-home-chart-head span {
          color: #9a7a57;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .msell-home-chart-head strong {
          color: #1f140c;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .msell-home-chart-body {
          position: relative;
          margin-top: 16px;
          flex: 1;
          min-height: 250px;
          border-radius: 24px;
          background: #fffdfa;
          border: 1px solid #ecdfcf;
          overflow: hidden;
        }

        .msell-home-chart-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(154, 122, 87, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(154, 122, 87, 0.08) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        .msell-home-chart-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          color: #2f1d10;
        }

        .msell-home-snapshot {
          margin-top: 20px;
          padding: 20px;
        }

        .msell-home-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 10px;
        }

        .msell-home-kpi {
          border: 1px solid #eadfce;
          background: #fffdfa;
          border-radius: 24px;
          padding: 18px 18px 20px;
        }

        .msell-home-kpi-label {
          display: block;
          color: #9a7a57;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .msell-home-kpi-value {
          display: block;
          color: #1f140c;
          font-size: clamp(20px, 2vw, 30px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .msell-home-latest {
          margin-top: 20px;
          padding: 22px;
        }

        .msell-home-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .msell-home-section-head h2 {
          margin: 0;
          color: #1f140c;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .msell-home-more {
          color: #2f1d10;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .msell-home-listings {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .msell-home-listing-card {
          display: block;
          border: 1px solid #eadfce;
          background: #fffdfa;
          border-radius: 24px;
          padding: 16px;
          text-decoration: none;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
          min-width: 0;
        }

        .msell-home-listing-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(47, 36, 23, 0.06);
        }

        .msell-home-listing-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .msell-home-listing-badge,
        .msell-home-listing-status {
          font-size: 12px;
          font-weight: 800;
          color: #8d7458;
        }

        .msell-home-listing-title {
          display: block;
          color: #1f140c;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 900;
          word-break: break-word;
        }

        .msell-home-listing-price {
          margin-top: 12px;
          color: #2f1d10;
          font-size: 15px;
          font-weight: 900;
        }

        .msell-home-empty {
          border: 1px dashed #ddcebb;
          background: #fffdfa;
          border-radius: 24px;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9a7a57;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
          padding: 20px;
        }

        @media (max-width: 1080px) {
          .msell-home-hero {
            grid-template-columns: 1fr;
          }

          .msell-home-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .msell-home-listings {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .msell-home {
            padding: 18px 12px 110px;
          }

          .msell-home-hero-copy,
          .msell-home-chart-card,
          .msell-home-snapshot,
          .msell-home-latest {
            border-radius: 24px;
          }

          .msell-home-hero-copy,
          .msell-home-chart-card,
          .msell-home-snapshot,
          .msell-home-latest {
            padding: 16px;
          }

          .msell-home-title {
            font-size: 34px;
          }

          .msell-home-subtitle {
            font-size: 14px;
          }

          .msell-home-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .msell-home-btn {
            width: 100%;
            min-height: 48px;
            padding: 0 12px;
            font-size: 14px;
          }

          .msell-home-kpis {
            grid-template-columns: 1fr 1fr;
          }

          .msell-home-listings {
            grid-template-columns: 1fr;
          }

          .msell-home-section-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 420px) {
          .msell-home-kpis {
            grid-template-columns: 1fr;
          }

          .msell-home-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}