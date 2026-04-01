import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title: string | null;
  listing_type?: string | null;
  category?: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  view_count?: number | null;
  price_negotiable?: boolean | null;
};

type CategoryTrendRow = {
  key: string;
  short: string;
  label: string;
  amount: number;
};

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₩ ${num.toLocaleString("ko-KR")}`;
}

function formatCompactWon(value: number) {
  if (value >= 100000000) {
    const n = value / 100000000;
    return `₩ ${n.toFixed(n % 1 === 0 ? 0 : 1)}억`;
  }

  if (value >= 10000) {
    const n = value / 10000;
    return `₩ ${n.toLocaleString("ko-KR")}만`;
  }

  return `₩ ${value.toLocaleString("ko-KR")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}. ${mm}. ${dd}.`;
}

function categoryMeta(rawType?: string | null) {
  const value = String(rawType || "").trim();

  switch (value) {
    case "youtube_channel":
    case "YouTube Channel":
      return { short: "YT", bg: "#fff1f2", color: "#b91c1c", label: "YouTube" };

    case "instagram_account":
    case "Instagram Account":
      return { short: "IG", bg: "#fdf0f7", color: "#b83b7c", label: "인스타" };

    case "tiktok_account":
    case "TikTok Account":
      return { short: "TT", bg: "#eefcff", color: "#0f766e", label: "틱톡" };

    case "website_blog":
    case "Website / Blog":
      return { short: "WB", bg: "#eff6ff", color: "#1d4ed8", label: "웹사이트" };

    case "store_commerce":
    case "Store / Commerce":
      return { short: "SC", bg: "#fefce8", color: "#a16207", label: "커머스" };

    case "saas_app":
    case "SaaS / App":
      return { short: "SA", bg: "#ecfdf5", color: "#15803d", label: "SaaS" };

    case "domain":
    case "Domain":
      return { short: "DM", bg: "#f3f4f6", color: "#111827", label: "도메인" };

    case "newsletter_community":
    case "Newsletter / Community":
      return { short: "NC", bg: "#fff7ed", color: "#c2410c", label: "뉴스레터" };

    case "course_digital_content":
    case "Course / Digital Content":
      return { short: "CD", bg: "#eef2ff", color: "#3730a3", label: "디지털콘텐츠" };

    case "marketing_asset":
    case "Marketing Asset":
      return { short: "MA", bg: "#ecfccb", color: "#4d7c0f", label: "마케팅자산" };

    default:
      return { short: "ETC", bg: "#f4ede3", color: "#6b4e33", label: value || "기타" };
  }
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "active":
      return "거래가능";
    default:
      return "";
  }
}

function resolveCategoryValue(item: ListingRow) {
  const category = String(item.category || "").trim();
  const listingType = String(item.listing_type || "").trim();

  const genericListingTypes = new Set(["sell", "buy", "wanted", "wtb", "wts"]);

  if (category) return category;
  if (listingType && !genericListingTypes.has(listingType.toLowerCase())) {
    return listingType;
  }

  return "기타";
}

function buildCategoryTrend(listings: ListingRow[]): CategoryTrendRow[] {
  const totals = new Map<string, CategoryTrendRow>();

  for (const item of listings) {
    const rawPrice = Number(item.price);
    if (Number.isNaN(rawPrice) || rawPrice <= 0) continue;

    const categoryValue = resolveCategoryValue(item);
    const meta = categoryMeta(categoryValue);
    const existing = totals.get(meta.label);

    if (existing) {
      existing.amount += rawPrice;
    } else {
      totals.set(meta.label, {
        key: meta.label,
        short: meta.short,
        label: meta.label,
        amount: rawPrice,
      });
    }
  }

  return Array.from(totals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

export default async function HomePage() {
  const supabase = await supabaseServer();
  const PUBLIC_HOME_STATUSES = ["active", "reserved"];

  const [
    latestListingsResult,
    activeCountResult,
    totalListingCountResult,
    totalDealCountResult,
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .in("status", PUBLIC_HOME_STATUSES)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .in("status", PUBLIC_HOME_STATUSES),

    supabase
      .from("listings")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("deals")
      .select("*", { count: "exact", head: true }),
  ]);

  const listings: ListingRow[] = Array.isArray(latestListingsResult.data)
    ? (latestListingsResult.data as ListingRow[])
    : [];

  const activeCount = activeCountResult.count ?? 0;
  const totalListingCount = totalListingCountResult.count ?? 0;
  const totalDealCount = totalDealCountResult.count ?? 0;

  const categoryTrend = buildCategoryTrend(listings);
  const maxTrendAmount =
    categoryTrend.length > 0
      ? Math.max(...categoryTrend.map((item) => item.amount))
      : 0;

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "20px 24px 80px",
      }}
    >
      <style>{`
        .home-top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.9fr);
          gap: 20px;
          align-items: stretch;
        }

        .home-lower-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.9fr);
          gap: 16px;
          margin-top: 16px;
          align-items: stretch;
        }

        .home-install-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
          margin-top: 16px;
        }

        .home-trade-flow-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .home-snapshot-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .home-listings-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .home-install-steps {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .home-install-step {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          padding: 12px 14px;
          border: 1px solid #d8c8b2;
          border-radius: 16px;
          background: #fffdfa;
        }

        .home-install-step-no {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #efe4d4;
          color: #6f5843;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        .home-listing-link {
          display: block;
          height: 100%;
          text-decoration: none;
          color: inherit;
        }

        .home-listing-card {
          height: 100%;
          min-height: 272px;
          border: 1px solid #d8c8b2;
          background: #fbf8f3;
          border-radius: 24px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .home-listing-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          flex-wrap: wrap;
        }

        .home-listing-title-wrap {
          margin-top: 18px;
          min-height: 108px;
          display: flex;
          align-items: flex-start;
        }

        .home-listing-title {
          margin: 0;
          color: #100a05;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.03em;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .home-listing-bottom {
          margin-top: auto;
          padding-top: 20px;
        }

        .home-listing-price {
          color: #100a05;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .home-listing-meta {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #7a6550;
          font-size: 12px;
          font-weight: 800;
        }

        .home-category-columns-wrap {
          flex: 1;
          min-height: 0;
          border-radius: 24px;
          border: 1px solid #d8c8b2;
          background: #fffdfa;
          padding: 18px 16px 14px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .home-category-columns-empty {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #7a6550;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.7;
        }

        .home-category-columns {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
          align-items: end;
          min-height: 240px;
        }

        .home-category-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          height: 100%;
        }

        .home-category-column-value {
          color: #7a6550;
          font-size: 11px;
          font-weight: 900;
          line-height: 1.2;
          text-align: center;
          word-break: keep-all;
        }

        .home-category-column-bar-wrap {
          width: 100%;
          height: 168px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .home-category-column-bar {
          width: min(44px, 100%);
          min-height: 16px;
          border-radius: 14px 14px 8px 8px;
          background: linear-gradient(180deg, rgba(205,150,92,0.95) 0%, rgba(145,93,41,1) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .home-category-column-label {
          color: #2f2417;
          font-size: 12px;
          font-weight: 900;
          line-height: 1.3;
          text-align: center;
          word-break: keep-all;
        }

        .hero-category-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .hero-category-tag {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.7);
          border: 1px solid #d8c8b2;
          color: #6c5843;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        @media (max-width: 1100px) {
          .home-listings-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .home-top-grid,
          .home-lower-grid,
          .home-install-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .home-trade-flow-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .home-snapshot-grid {
            grid-template-columns: 1fr;
          }

          .home-listings-grid {
            grid-template-columns: 1fr;
          }

          .home-listing-card {
            min-height: 236px;
          }

          .home-listing-title-wrap {
            min-height: auto;
          }

          .home-listing-title {
            font-size: 24px;
            -webkit-line-clamp: 2;
          }

          .home-category-columns {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            row-gap: 18px;
            min-height: auto;
          }

          .home-category-column-bar-wrap {
            height: 120px;
          }

          .home-category-column-value,
          .home-category-column-label {
            font-size: 11px;
          }
        }
      `}</style>

      <section className="home-top-grid">
        <div
          style={{
            background: "#f2eadf",
            border: "1px solid #d8c8b2",
            borderRadius: 28,
            padding: 28,
            minHeight: 350,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 12px",
                borderRadius: 999,
                background: "#e7dccb",
                color: "#8a633d",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              MSELL
            </div>

            <h1
              style={{
                marginTop: 20,
                marginBottom: 18,
                fontSize: 64,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#1f140c",
              }}
            >
              복잡한 디지털 자산 거래를 위한
              <br />
              프라이빗 마켓
            </h1>

            <p
              style={{
                margin: 0,
                color: "#6c5843",
                fontSize: 15,
                lineHeight: 1.8,
                fontWeight: 600,
              }}
            >
              공개 노출이 부담스럽고 조건 조율이 중요한 거래를 위해, 매칭부터 협의까지 더 정제된 흐름을 제공합니다.
            </p>

            <div className="hero-category-tags">
              {["YouTube Channel", "Instagram Account", "Website", "Domain"].map(
                (item) => (
                  <span key={item} className="hero-category-tag">
                    {item}
                  </span>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 48,
                  padding: "0 20px",
                  borderRadius: 999,
                  background: "#2f2417",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                거래목록 보기
              </Link>

              <Link
                href="/listings/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 48,
                  padding: "0 20px",
                  borderRadius: 999,
                  background: "#fff",
                  color: "#2f2417",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "1px solid #d8c8b2",
                }}
              >
                자산 등록하기
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginTop: 24,
            }}
          >
            {[
              { title: "빠른 등록", body: "핵심 정보 중심" },
              { title: "안전한 문의", body: "딜룸 연결" },
              { title: "명확한 이전", body: "절차 가시화" },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#f6efe6",
                  border: "1px solid #d8c8b2",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    color: "#2a1a0f",
                    fontWeight: 800,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    color: "#76624c",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#f7f2ea",
            border: "1px solid #d8c8b2",
            borderRadius: 28,
            padding: 20,
            minHeight: 350,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  color: "#aa7a4a",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                AMOUNT TREND
              </div>
              <div
                style={{
                  color: "#1f140c",
                  fontSize: 18,
                  fontWeight: 900,
                  marginTop: 4,
                }}
              >
                카테고리별 거래금액
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 30,
                padding: "0 12px",
                borderRadius: 999,
                background: "#efe4d4",
                color: "#6c5843",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              최근 등록 기준
            </div>
          </div>

          <div className="home-category-columns-wrap">
            {categoryTrend.length === 0 ? (
              <div className="home-category-columns-empty">
                카테고리별 금액을 표시할 데이터가 아직 없습니다.
              </div>
            ) : (
              <div className="home-category-columns">
                {categoryTrend.map((item) => {
                  const height =
                    maxTrendAmount > 0
                      ? Math.max(16, (item.amount / maxTrendAmount) * 168)
                      : 16;

                  return (
                    <div key={item.key} className="home-category-column">
                      <div className="home-category-column-value">
                        {formatCompactWon(item.amount)}
                      </div>

                      <div className="home-category-column-bar-wrap">
                        <div
                          className="home-category-column-bar"
                          style={{ height }}
                        />
                      </div>

                      <div className="home-category-column-label">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="home-lower-grid">
        <div
          style={{
            background: "#fbf8f3",
            border: "1px solid #d8c8b2",
            borderRadius: 24,
            padding: 20,
          }}
        >
          <div
            style={{
              color: "#aa7a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            TRADE FLOW
          </div>

          <div
            style={{
              color: "#1a120b",
              fontSize: 18,
              fontWeight: 900,
              marginBottom: 14,
            }}
          >
            거래 진행 4단계
          </div>

          <div className="home-trade-flow-grid">
            {[
              ["01", "매물 확인"],
              ["02", "거래 문의"],
              ["03", "조건 협의"],
              ["04", "이전 완료"],
            ].map(([step, label]) => (
              <div
                key={step}
                style={{
                  border: "1px solid #d8c8b2",
                  borderRadius: 18,
                  background: "#fff",
                  padding: 14,
                  minHeight: 92,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    color: "#8b735d",
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  {step}
                </div>
                <div
                  style={{
                    color: "#140d07",
                    fontSize: 20,
                    fontWeight: 900,
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fbf8f3",
            border: "1px solid #d8c8b2",
            borderRadius: 24,
            padding: 16,
          }}
        >
          <div
            style={{
              color: "#aa7a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            LIVE SNAPSHOT
          </div>

          <div className="home-snapshot-grid">
            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 16,
                background: "#fff",
                padding: "14px 14px 12px",
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 10, fontWeight: 700 }}>
                현재 공개 자산
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#0f0a05",
                  fontSize: 26,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {activeCount}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 16,
                background: "#fff",
                padding: "14px 14px 12px",
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 10, fontWeight: 700 }}>
                누적 등록 수
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#0f0a05",
                  fontSize: 26,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {totalListingCount}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 16,
                background: "#fff",
                padding: "14px 14px 12px",
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 10, fontWeight: 700 }}>
                거래 종료 수
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#0f0a05",
                  fontSize: 26,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {totalDealCount}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-install-grid">
        <div
          style={{
            background: "#fbf8f3",
            border: "1px solid #d8c8b2",
            borderRadius: 24,
            padding: 20,
          }}
        >
          <div
            style={{
              color: "#aa7a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            IPHONE INSTALL
          </div>

          <div
            style={{
              color: "#1a120b",
              fontSize: 20,
              fontWeight: 900,
              marginBottom: 6,
            }}
          >
            아이폰에 설치하기
          </div>

          <div
            style={{
              color: "#7a6550",
              fontSize: 14,
              lineHeight: 1.7,
              fontWeight: 600,
            }}
          >
            Safari에서 홈 화면에 추가하면 앱처럼 바로 실행할 수 있습니다.
          </div>

          <div className="home-install-steps">
            {[
              "아이폰 Safari에서 msell.app 접속",
              "하단 공유 버튼 선택",
              "홈 화면에 추가 선택",
              "이름 확인 후 추가",
            ].map((text, index) => (
              <div key={text} className="home-install-step">
                <span className="home-install-step-no">{index + 1}</span>
                <div
                  style={{
                    color: "#2f2417",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 800,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fbf8f3",
            border: "1px solid #d8c8b2",
            borderRadius: 24,
            padding: 20,
            display: "grid",
            gap: 14,
          }}
        >
          <div
            style={{
              color: "#aa7a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            APP STATUS
          </div>

          <div
            style={{
              color: "#1a120b",
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            현재 설치 방식
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 18,
                background: "#fffdfa",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  color: "#2f2417",
                  fontSize: 14,
                  fontWeight: 900,
                  marginBottom: 4,
                }}
              >
                아이폰
              </div>
              <div
                style={{
                  color: "#7a6550",
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                Safari에서 홈 화면에 추가하는 설치형 웹앱
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 18,
                background: "#fffdfa",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  color: "#2f2417",
                  fontSize: 14,
                  fontWeight: 900,
                  marginBottom: 4,
                }}
              >
                안드로이드
              </div>
              <div
                style={{
                  color: "#7a6550",
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                플레이스토어 업로드 준비 완료
              </div>
            </div>
          </div>

          <div
            style={{
              color: "#7a6550",
              fontSize: 12,
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            앱스토어 정식 등록형 iOS 앱은 다음 단계에서 별도로 진행합니다.
          </div>
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                color: "#aa7a4a",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              LIVE LISTINGS
            </div>
            <div
              style={{
                marginTop: 4,
                color: "#120c07",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              최신 등록 자산
            </div>
          </div>

          <Link
            href="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              padding: "0 18px",
              borderRadius: 999,
              background: "#fff",
              color: "#2f2417",
              textDecoration: "none",
              border: "1px solid #d8c8b2",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            전체 자산 보기
          </Link>
        </div>

        {listings.length === 0 ? (
          <div
            style={{
              border: "1px solid #d8c8b2",
              background: "#fbf8f3",
              borderRadius: 24,
              padding: 28,
              color: "#6e5a47",
              fontWeight: 700,
            }}
          >
            노출 가능한 자산이 아직 없습니다.
          </div>
        ) : (
          <div className="home-listings-grid">
            {listings.map((item) => {
              const meta = categoryMeta(resolveCategoryValue(item));
              const status = statusLabel(item.status);

              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="home-listing-link"
                >
                  <article className="home-listing-card">
                    <div className="home-listing-top">
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            minWidth: 30,
                            height: 30,
                            borderRadius: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: meta.bg,
                            color: meta.color,
                            fontSize: 11,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {meta.short}
                        </span>

                        <span
                          style={{
                            color: "#6b4e33",
                            fontSize: 12,
                            fontWeight: 800,
                            lineHeight: 1.3,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: item.price_negotiable ? "#ecfdf5" : "#f3f4f6",
                            color: item.price_negotiable ? "#166534" : "#374151",
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {item.price_negotiable ? "협의가능" : "협의불가"}
                        </span>

                        {status ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "#efe4d4",
                              color: "#7c624a",
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {status}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="home-listing-title-wrap">
                      <h3 className="home-listing-title">
                        {item.title || "제목 없음"}
                      </h3>
                    </div>

                    <div className="home-listing-bottom">
                      <div className="home-listing-price">
                        {formatPrice(item.price)}
                      </div>

                      <div className="home-listing-meta">
                        <span>{formatDate(item.created_at)}</span>
                        <span>조회 {item.view_count ?? 0}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}