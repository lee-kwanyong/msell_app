import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  view_count?: number | null;
  price_negotiable?: boolean | null;
};

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₩ ${num.toLocaleString("ko-KR")}`;
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

function categoryMeta(category?: string | null) {
  switch (category) {
    case "YouTube Channel":
      return { short: "YT", bg: "#fff1f2", color: "#b91c1c", label: "YouTube Channel" };
    case "Instagram Account":
      return { short: "IG", bg: "#fdf0f7", color: "#b83b7c", label: "Instagram Account" };
    case "TikTok Account":
      return { short: "TT", bg: "#eefcff", color: "#0f766e", label: "TikTok Account" };
    case "Website / Blog":
      return { short: "WB", bg: "#eff6ff", color: "#1d4ed8", label: "Website / Blog" };
    case "Store / Commerce":
      return { short: "SC", bg: "#fefce8", color: "#a16207", label: "Store / Commerce" };
    case "SaaS / App":
      return { short: "SA", bg: "#ecfdf5", color: "#15803d", label: "SaaS / App" };
    case "Domain":
      return { short: "DM", bg: "#f3f4f6", color: "#111827", label: "Domain" };
    case "Newsletter / Community":
      return { short: "NC", bg: "#fff7ed", color: "#c2410c", label: "Newsletter / Community" };
    case "Course / Digital Content":
      return { short: "CD", bg: "#eef2ff", color: "#3730a3", label: "Course / Digital Content" };
    case "Marketing Asset":
      return { short: "MA", bg: "#ecfccb", color: "#4d7c0f", label: "Marketing Asset" };
    default:
      return { short: "ETC", bg: "#f4ede3", color: "#6b4e33", label: category || "기타" };
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

export default async function HomePage() {
  const supabase = await supabaseServer();
  const PUBLIC_HOME_STATUSES = ["active", "reserved"];

  const [
    { data: latestListings },
    { count: activeCount },
    { count: totalListingCount },
    { count: totalDealCount },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id,title,category,price,status,created_at,view_count,price_negotiable")
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

  const listings: ListingRow[] = Array.isArray(latestListings) ? latestListings : [];
  const todayTrendValue = listings.length > 0 ? listings.length : 0;

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

        .home-trade-flow-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .home-snapshot-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .home-listings-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 1100px) {
          .home-listings-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .home-top-grid,
          .home-lower-grid {
            grid-template-columns: 1fr;
          }

          .home-snapshot-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
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
              디지털 자산
              <br />
              마켓플레이스
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
              복잡한 디지털 자산 거래를 위한 프라이빗 마켓
              <br />
              공개 노출이 부담스럽고 조건 조율이 중요한 거래를 위해, 매칭부터 협의까지 더 정제된 흐름을 제공합니다.
            </p>

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
                거래금액 추이
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
              최근 7건
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              border: "1px solid #d8c8b2",
              background: "#fffdfa",
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 24,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 42,
                  height: Math.max(84, Math.min(190, todayTrendValue * 22)),
                  margin: "0 auto",
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, rgba(205,150,92,0.95) 0%, rgba(145,93,41,1) 100%)",
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#7d664f",
                }}
              >
                {formatDate(new Date().toISOString())}
              </div>
            </div>
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
            padding: 20,
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
                borderRadius: 18,
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 11, fontWeight: 700 }}>
                현재 공개 자산
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: "#0f0a05",
                  fontSize: 42,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {activeCount ?? 0}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 18,
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 11, fontWeight: 700 }}>
                누적 등록 수
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: "#0f0a05",
                  fontSize: 42,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {totalListingCount ?? 0}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d8c8b2",
                borderRadius: 18,
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ color: "#7a6550", fontSize: 11, fontWeight: 700 }}>
                거래 종료 수
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: "#0f0a05",
                  fontSize: 42,
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {totalDealCount ?? 0}
              </div>
            </div>
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
              const meta = categoryMeta(item.category);
              const status = statusLabel(item.status);

              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <article
                    style={{
                      minHeight: 228,
                      border: "1px solid #d8c8b2",
                      background: "#fbf8f3",
                      borderRadius: 24,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
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

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
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

                    <div style={{ marginTop: 18 }}>
                      <h3
                        style={{
                          margin: 0,
                          color: "#100a05",
                          fontSize: 28,
                          lineHeight: 1.2,
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.title || "제목 없음"}
                      </h3>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div
                        style={{
                          color: "#100a05",
                          fontSize: 22,
                          fontWeight: 900,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {formatPrice(item.price)}
                      </div>

                      <div
                        style={{
                          marginTop: 18,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "#7a6550",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
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