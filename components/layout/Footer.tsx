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
    supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "sold"),
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
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 96px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(340px, 0.95fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 36,
              padding: "42px 36px 34px",
              minHeight: 440,
              background:
                "radial-gradient(circle at top right, rgba(137,95,54,0.16), transparent 26%), linear-gradient(135deg, #fffdf9 0%, #f7f0e6 52%, #efe2cf 100%)",
              border: "1px solid #eadfce",
              boxShadow: "0 24px 60px rgba(61, 41, 22, 0.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -30,
                width: 220,
                height: 220,
                borderRadius: 999,
                background:
                  "radial-gradient(circle, rgba(112,72,37,0.15) 0%, rgba(112,72,37,0.04) 45%, transparent 72%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                maxWidth: 760,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 999,
                  background: "#f3e7d6",
                  color: "#7b6248",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  marginBottom: 22,
                }}
              >
                MSELL
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#17110c",
                  fontSize: 64,
                  lineHeight: 1.02,
                  letterSpacing: "-0.035em",
                  fontWeight: 900,
                  wordBreak: "keep-all",
                }}
              >
                <span
                  style={{
                    display: "block",
                  }}
                >
                  디지털 자산
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 8,
                    background:
                      "linear-gradient(180deg, #17110c 0%, #332318 60%, #6c4526 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  마켓플레이스
                </span>
              </h1>

              <p
                style={{
                  margin: "26px 0 0",
                  maxWidth: 620,
                  color: "#6e5944",
                  fontSize: 18,
                  lineHeight: 1.8,
                  fontWeight: 650,
                  wordBreak: "keep-all",
                }}
              >
                계정, 채널, 도메인, 웹사이트, 디지털 상품까지.
                <br />
                등록부터 문의, 협의, 이전까지 한 흐름으로 연결되는 거래 공간.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 28,
                }}
              >
                <Link
                  href="/listings"
                  style={{
                    height: 52,
                    padding: "0 20px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 15,
                    fontWeight: 900,
                    boxShadow: "0 12px 24px rgba(47, 36, 23, 0.18)",
                  }}
                >
                  거래목록 보기
                </Link>

                <Link
                  href="/listings/create"
                  style={{
                    height: 52,
                    padding: "0 20px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    background: "#fffdf9",
                    border: "1px solid #e2d4c2",
                    color: "#2f2417",
                    fontSize: 15,
                    fontWeight: 900,
                  }}
                >
                  자산 등록하기
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 28,
                  maxWidth: 560,
                }}
              >
                {[
                  ["빠른 등록", "핵심 정보 중심"],
                  ["안전한 문의", "딜룸 연결"],
                  ["명확한 이전", "절차 가시화"],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    style={{
                      borderRadius: 20,
                      padding: "14px 14px 12px",
                      background: "rgba(255,253,249,0.76)",
                      border: "1px solid #eadfce",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        color: "#1e1610",
                        fontSize: 15,
                        fontWeight: 900,
                        marginBottom: 4,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        color: "#7a6651",
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1.55,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            style={{
              borderRadius: 32,
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              padding: 20,
              boxShadow: "0 20px 44px rgba(61, 41, 22, 0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#a58a6d",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    marginBottom: 6,
                  }}
                >
                  AMOUNT TREND
                </div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
                  거래금액 추이
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f2e8db",
                  color: "#7f684f",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                최근 7건
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 250,
                borderRadius: 26,
                border: "1px solid #eadfce",
                background: "#fffdf9",
                padding: "24px 18px 16px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              {recentAmountSeries.length === 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8a7156",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  표시할 데이터가 없습니다.
                </div>
              ) : (
                recentAmountSeries.map((item, index) => {
                  const height = Math.max(42, Math.round((item.value / maxAmount) * 150));

                  return (
                    <div
                      key={`${item.date}-${index}`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 44,
                          height,
                          borderRadius: 999,
                          background:
                            "linear-gradient(180deg, #d0a879 0%, #a16e3d 48%, #744a26 100%)",
                          boxShadow: "0 12px 20px rgba(110, 73, 37, 0.14)",
                        }}
                      />
                      <div
                        style={{
                          color: "#8a7156",
                          fontSize: 11,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.date}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 18,
            marginTop: 18,
          }}
        >
          <section
            style={{
              borderRadius: 30,
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              padding: 20,
              boxShadow: "0 16px 34px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                color: "#a58a6d",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              LIVE SNAPSHOT
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {[
                ["현재 공개 자산", String(activeListings)],
                ["누적 등록 수", String(totalListings)],
                ["거래 종료 수", String(soldListings)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 24,
                    background: "#fffdf9",
                    border: "1px solid #eadfce",
                    padding: "18px 18px 16px",
                  }}
                >
                  <div
                    style={{
                      color: "#9a846d",
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 10,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      color: "#16110d",
                      fontSize: 34,
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              borderRadius: 30,
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              padding: 20,
              boxShadow: "0 16px 34px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                color: "#a58a6d",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              TRADE FLOW
            </div>

            <div
              style={{
                color: "#16110d",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                marginBottom: 16,
              }}
            >
              거래 진행 4단계
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {[
                ["01", "매물 확인"],
                ["02", "거래 문의"],
                ["03", "조건 협의"],
                ["04", "이전 완료"],
              ].map(([no, label]) => (
                <div
                  key={no}
                  style={{
                    borderRadius: 20,
                    background: "#fffdf9",
                    border: "1px solid #eadfce",
                    padding: "18px 16px 16px",
                  }}
                >
                  <div
                    style={{
                      color: "#a58a6d",
                      fontSize: 12,
                      fontWeight: 900,
                      marginBottom: 10,
                    }}
                  >
                    {no}
                  </div>
                  <div
                    style={{
                      color: "#16110d",
                      fontSize: 16,
                      fontWeight: 900,
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#a58a6d",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  marginBottom: 6,
                }}
              >
                LIVE LISTINGS
              </div>
              <div
                style={{
                  color: "#16110d",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                최신 등록 자산
              </div>
            </div>

            <Link
              href="/listings"
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#fffdf9",
                border: "1px solid #e1d4c3",
                color: "#2f2417",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              전체 자산 보기
            </Link>
          </div>

          {latestListings.length === 0 ? (
            <div
              style={{
                borderRadius: 30,
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                padding: "40px 24px",
                textAlign: "center",
                boxShadow: "0 16px 34px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  color: "#16110d",
                  fontSize: 22,
                  fontWeight: 900,
                  marginBottom: 10,
                }}
              >
                등록된 자산이 없습니다
              </div>
              <Link
                href="/listings/create"
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                자산등록
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {latestListings.map((item) => {
                const tone = statusTone(item.status);

                return (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        borderRadius: 28,
                        background: "#fbf7f1",
                        border: "1px solid #eadfce",
                        padding: 20,
                        boxShadow: "0 16px 34px rgba(61, 41, 22, 0.06)",
                        minHeight: 220,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 999,
                            background: "#f2e8db",
                            color: "#7f684f",
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          {item.category || "기타"}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 999,
                            background: tone.background,
                            color: tone.color,
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#16110d",
                          fontSize: 30,
                          fontWeight: 900,
                          letterSpacing: "-0.05em",
                          lineHeight: 1.05,
                          marginBottom: 18,
                          minHeight: 66,
                          wordBreak: "keep-all",
                        }}
                      >
                        {item.title || "제목 없음"}
                      </div>

                      <div
                        style={{
                          color: "#1f1510",
                          fontSize: 20,
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                          marginBottom: 16,
                        }}
                      >
                        {formatPrice(item.price)}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          color: "#8a7156",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
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