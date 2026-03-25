import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

function formatPrice(price?: number | null) {
  if (typeof price === "number") {
    return `${price.toLocaleString()}원`;
  }

  return "협의";
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "판매 중";
    case "hidden":
      return "숨김";
    case "sold":
      return "판매 완료";
    case "deleted":
      return "삭제";
    default:
      return "판매 중";
  }
}

function getStatusStyle(status?: string | null) {
  switch (status) {
    case "sold":
      return {
        background: "#edf8ef",
        color: "#1e6a2d",
        border: "1px solid #cfe7d5",
      };
    case "hidden":
      return {
        background: "#f3f1ed",
        color: "#6a6157",
        border: "1px solid #ddd4c8",
      };
    case "deleted":
      return {
        background: "#fff3f3",
        color: "#9d2525",
        border: "1px solid #f0caca",
      };
    default:
      return {
        background: "#fff8ea",
        color: "#8a6116",
        border: "1px solid #ecd9ad",
      };
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const [{ data: listings }, { data: deals }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, category, price, status, description, created_at")
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("deals")
      .select("id, status")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const activeListingsCount =
    (listings || []).filter((item) => item.status === "active").length || 0;

  const openDealsCount =
    (deals || []).filter(
      (item) => item.status === "open" || item.status === "in_progress"
    ).length || 0;

  const completedDealsCount =
    (deals || []).filter((item) => item.status === "completed").length || 0;

  return (
    <main
      style={{
        background: "#f6f1e7",
        minHeight: "100vh",
        padding: "28px 16px 90px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f2e8 100%)",
            borderRadius: 32,
            padding: 32,
            boxShadow: "0 18px 50px rgba(47,36,23,0.08)",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
                background: "#eadfcf",
                color: "#2f2417",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Digital Asset Deal Flow Marketplace
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 44,
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  color: "#1f170f",
                }}
              >
                디지털 자산 거래를
                <br />
                더 단순하고 선명하게
              </h1>

              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: "#5a4b3c",
                  maxWidth: 720,
                }}
              >
                Msell은 등록글 생성, 거래 문의, 거래방 메시지, 상태 변경, 알림까지
                하나의 흐름으로 연결하는 디지털 자산 거래 플랫폼입니다.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/listings"
                style={{
                  textDecoration: "none",
                  background: "#2f2417",
                  color: "#ffffff",
                  padding: "15px 20px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                등록글 둘러보기
              </Link>

              <Link
                href="/listings/create"
                style={{
                  textDecoration: "none",
                  background: "#eadfcf",
                  color: "#2f2417",
                  padding: "15px 20px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                새 등록글 작성
              </Link>

              <Link
                href="/my/deals"
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  color: "#2f2417",
                  border: "1px solid #eadfcf",
                  padding: "15px 20px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                내 거래 보기
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  background: "#fffaf2",
                  border: "1px solid #eee1cf",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 8 }}>
                  최근 노출 등록글
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
                  {activeListingsCount}
                </div>
              </div>

              <div
                style={{
                  background: "#fffaf2",
                  border: "1px solid #eee1cf",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 8 }}>
                  진행 중 거래
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
                  {openDealsCount}
                </div>
              </div>

              <div
                style={{
                  background: "#fffaf2",
                  border: "1px solid #eee1cf",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 8 }}>
                  완료 거래
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
                  {completedDealsCount}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              alignContent: "stretch",
            }}
          >
            <div
              style={{
                background: "#2f2417",
                color: "#ffffff",
                borderRadius: 24,
                padding: 24,
                display: "grid",
                gap: 14,
                minHeight: 220,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.74)",
                  fontWeight: 700,
                }}
              >
                Why Msell
              </div>

              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.2,
                  fontWeight: 900,
                }}
              >
                게시글에서 끝나지 않고
                <br />
                거래 흐름까지 이어집니다.
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                등록 → 문의 → 거래방 → 메시지 → 상태 변경 → 알림까지
                실제 운영에 필요한 기본 플로우를 하나로 묶었습니다.
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: 22,
                border: "1px solid #efe3d3",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 14, color: "#7a6a58", fontWeight: 800 }}>
                핵심 진입점
              </div>

              <Link
                href="/notifications"
                style={{
                  textDecoration: "none",
                  background: "#fbf8f3",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#241b11",
                  fontWeight: 800,
                }}
              >
                알림 확인하기
              </Link>

              <Link
                href="/my/listings"
                style={{
                  textDecoration: "none",
                  background: "#fbf8f3",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#241b11",
                  fontWeight: 800,
                }}
              >
                내 등록글 관리
              </Link>

              <Link
                href="/my/deals"
                style={{
                  textDecoration: "none",
                  background: "#fbf8f3",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#241b11",
                  fontWeight: 800,
                }}
              >
                내 거래 관리
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: "#7a6a58", fontWeight: 800 }}>
              STEP 01
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
              등록글 생성
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#5b4d3f" }}>
              자산 정보, 설명, 가격, 카테고리를 입력해 거래 가능한 등록글을 만듭니다.
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: "#7a6a58", fontWeight: 800 }}>
              STEP 02
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
              거래 문의 시작
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#5b4d3f" }}>
              구매자는 등록글 상세에서 즉시 거래방을 만들고 판매자와 메시지를 주고받을 수 있습니다.
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: "#7a6a58", fontWeight: 800 }}>
              STEP 03
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#241b11" }}>
              상태와 알림 관리
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#5b4d3f" }}>
              거래 상태와 등록글 상태를 변경하고 알림으로 주요 변화를 빠르게 확인합니다.
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 28,
            padding: 26,
            boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: "#7a6a58", marginBottom: 6 }}>
                최근 등록글
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.2,
                  color: "#22190f",
                }}
              >
                Recently Added
              </h2>
            </div>

            <Link
              href="/listings"
              style={{
                textDecoration: "none",
                background: "#eadfcf",
                color: "#2f2417",
                padding: "12px 16px",
                borderRadius: 12,
                fontWeight: 800,
              }}
            >
              전체 등록글 보기
            </Link>
          </div>

          {listings && listings.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 18,
              }}
            >
              {listings.map((listing) => {
                const statusStyle = getStatusStyle(listing.status);

                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    style={{
                      textDecoration: "none",
                      background: "#fbf8f3",
                      borderRadius: 22,
                      padding: 20,
                      display: "grid",
                      gap: 14,
                      color: "#241b11",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 19,
                            fontWeight: 900,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                            marginBottom: 8,
                          }}
                        >
                          {listing.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#8a7865",
                          }}
                        >
                          {listing.category || "미분류"}
                        </div>
                      </div>

                      <div
                        style={{
                          ...statusStyle,
                          borderRadius: 999,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {getStatusLabel(listing.status)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: "#554636",
                        minHeight: 74,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {listing.description || "설명이 없습니다."}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: 16,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 6 }}>
                          가격
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>
                          {formatPrice(listing.price)}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#ffffff",
                          borderRadius: 16,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 6 }}>
                          등록일
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>
                          {listing.created_at
                            ? new Date(listing.created_at).toLocaleDateString("ko-KR")
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                background: "#fbf8f3",
                borderRadius: 20,
                padding: 22,
                color: "#7a6a58",
                fontSize: 15,
              }}
            >
              아직 등록된 자산이 없습니다.
            </div>
          )}
        </section>

        <section
          style={{
            background: "#2f2417",
            color: "#ffffff",
            borderRadius: 30,
            padding: 30,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 8,
                fontWeight: 800,
              }}
            >
              Ready to Start
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              첫 등록글을 올리고
              <br />
              거래 흐름을 시작해보세요.
            </div>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              목록 노출, 거래 문의, 메시지, 상태 관리까지 한 번에 연결됩니다.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/listings/create"
              style={{
                textDecoration: "none",
                background: "#ffffff",
                color: "#2f2417",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 900,
              }}
            >
              등록글 작성
            </Link>

            <Link
              href="/listings"
              style={{
                textDecoration: "none",
                background: "#eadfcf",
                color: "#2f2417",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 900,
              }}
            >
              마켓 보기
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          section[style*="grid-template-columns: 1.2fr 0.8fr"] {
            grid-template-columns: 1fr !important;
          }

          section[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          div[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          section[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          section[style*="grid-template-columns: 1fr auto"] {
            grid-template-columns: 1fr !important;
          }

          h1 {
            font-size: 34px !important;
          }
        }
      `}</style>
    </main>
  );
}