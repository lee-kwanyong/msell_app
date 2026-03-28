import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₩ ${num.toLocaleString("ko-KR")}`;
}

function parseTransferMethod(description?: string | null) {
  if (!description) return "";
  const match = description.match(/^\[이전 방식\]\s*(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

function parseBodyDescription(description?: string | null) {
  if (!description) return "";
  return description.replace(/^\[이전 방식\]\s*.+\n\n?/m, "").trim();
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "거래가능";
    case "hidden":
      return "숨김";
    case "draft":
      return "임시저장";
    case "sold":
      return "거래종료";
    case "reserved":
      return "예약중";
    default:
      return status || "-";
  }
}

function categoryMeta(category?: string | null) {
  switch (category) {
    case "YouTube Channel":
      return {
        short: "YT",
        bg: "#fff1f2",
        color: "#b91c1c",
        guide: "채널 주제, 구독자 성격, 수익화 상태, 운영 기간을 확인하기 좋은 유형",
      };
    case "Instagram Account":
      return {
        short: "IG",
        bg: "#fdf0f7",
        color: "#b83b7c",
        guide: "팔로워 품질, 주제 적합성, 계정 히스토리를 함께 보는 유형",
      };
    case "TikTok Account":
      return {
        short: "TT",
        bg: "#eefcff",
        color: "#0f766e",
        guide: "짧은 영상 중심 성장 계정과 콘텐츠 운영권 거래에 적합한 유형",
      };
    case "Website / Blog":
      return {
        short: "WB",
        bg: "#eff6ff",
        color: "#1d4ed8",
        guide: "트래픽, SEO, 수익 구조, 운영 이력을 확인하기 좋은 유형",
      };
    case "Store / Commerce":
      return {
        short: "SC",
        bg: "#fefce8",
        color: "#a16207",
        guide: "상품 구조, 주문 흐름, 고객 재구매 데이터를 확인하기 좋은 유형",
      };
    case "SaaS / App":
      return {
        short: "SA",
        bg: "#ecfdf5",
        color: "#15803d",
        guide: "사용자 수, 결제 구조, 운영 문서 인계가 중요한 유형",
      };
    case "Domain":
      return {
        short: "DM",
        bg: "#f3f4f6",
        color: "#111827",
        guide: "짧고 명확한 네이밍, 브랜드 확장성, 이전 절차가 중요한 유형",
      };
    case "Newsletter / Community":
      return {
        short: "NC",
        bg: "#fff7ed",
        color: "#c2410c",
        guide: "구독자 반응과 커뮤니티 활동성이 핵심인 유형",
      };
    case "Course / Digital Content":
      return {
        short: "CD",
        bg: "#eef2ff",
        color: "#3730a3",
        guide: "강의 자료, 판권 범위, 업데이트 권한이 핵심인 유형",
      };
    case "Marketing Asset":
      return {
        short: "MA",
        bg: "#ecfccb",
        color: "#4d7c0f",
        guide: "광고 계정, 운영 데이터, 성과 기록을 함께 보는 유형",
      };
    default:
      return {
        short: "ETC",
        bg: "#f4ede3",
        color: "#6b4e33",
        guide: "거래 대상의 핵심 정보와 이전 범위를 명확히 확인하세요.",
      };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const isOwner = user?.id && listing.user_id === user.id;
  const isPublicVisible = ["active", "reserved", "sold"].includes(listing.status ?? "");

  if (!isOwner && !isPublicVisible) {
    notFound();
  }

  const transferMethod = parseTransferMethod(listing.description);
  const bodyDescription = parseBodyDescription(listing.description);
  const meta = categoryMeta(listing.category);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "28px 16px 120px",
      }}
    >
      <style>{`
        .listing-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .listing-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              padding: "0 16px",
              borderRadius: 999,
              background: "#fffdf9",
              border: "1px solid #d8c8b2",
              color: "#5e4a38",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            거래목록으로
          </Link>

          {isOwner ? (
            <Link
              href={`/listings/${listing.id}/edit`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 42,
                padding: "0 16px",
                borderRadius: 999,
                background: "#2f2417",
                border: "none",
                color: "#fffaf2",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              매물 수정
            </Link>
          ) : null}
        </div>

        <div className="listing-detail-grid">
          <section
            style={{
              background: "#f2eadf",
              border: "1px solid #dbcdb9",
              borderRadius: 28,
              padding: 22,
              display: "grid",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#fffdf9",
                  border: "1px solid #d8c8b2",
                  color: "#6b4e33",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: meta.bg,
                    color: meta.color,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  {meta.short}
                </span>
                {listing.category || "기타"}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: listing.price_negotiable ? "#ecfdf5" : "#f3f4f6",
                  color: listing.price_negotiable ? "#166534" : "#374151",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {listing.price_negotiable ? "금액 협의 가능" : "금액 협의 불가"}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#fffdf9",
                  color: "#6b4e33",
                  fontSize: 12,
                  fontWeight: 900,
                  border: "1px solid #d8c8b2",
                }}
              >
                {statusLabel(listing.status)}
              </span>
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#1f140c",
                  fontSize: 38,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {listing.title || "제목 없음"}
              </h1>

              <div
                style={{
                  marginTop: 14,
                  color: "#100a05",
                  fontSize: 30,
                  lineHeight: 1.15,
                  fontWeight: 900,
                }}
              >
                {formatPrice(listing.price)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid #d8c8b2",
                background: "#fffdf9",
                padding: 18,
              }}
            >
              <div
                style={{
                  color: "#8a7156",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                카테고리 안내
              </div>
              <div
                style={{
                  color: "#2f2417",
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                {meta.guide}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid #d8c8b2",
                background: "#fffdf9",
                padding: 18,
              }}
            >
              <div
                style={{
                  color: "#8a7156",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                이전 방식
              </div>
              <div
                style={{
                  color: "#2f2417",
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontWeight: 800,
                }}
              >
                {transferMethod || "-"}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid #d8c8b2",
                background: "#fffdf9",
                padding: 18,
              }}
            >
              <div
                style={{
                  color: "#8a7156",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                설명
              </div>
              <div
                style={{
                  color: "#2f2417",
                  fontSize: 15,
                  lineHeight: 1.8,
                  fontWeight: 700,
                  whiteSpace: "pre-wrap",
                }}
              >
                {bodyDescription || "-"}
              </div>
            </div>
          </section>

          <aside
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <section
              style={{
                background: "#f2eadf",
                border: "1px solid #dbcdb9",
                borderRadius: 28,
                padding: 18,
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  color: "#1f140c",
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                거래 정보
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid #d8c8b2",
                  background: "#fffdf9",
                  padding: "14px 16px",
                }}
              >
                <div style={{ color: "#8a7156", fontSize: 12, fontWeight: 900, marginBottom: 6 }}>
                  상태
                </div>
                <div style={{ color: "#2f2417", fontSize: 14, fontWeight: 800 }}>
                  {statusLabel(listing.status)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid #d8c8b2",
                  background: "#fffdf9",
                  padding: "14px 16px",
                }}
              >
                <div style={{ color: "#8a7156", fontSize: 12, fontWeight: 900, marginBottom: 6 }}>
                  가격 협의
                </div>
                <div style={{ color: "#2f2417", fontSize: 14, fontWeight: 800 }}>
                  {listing.price_negotiable ? "가능" : "불가능"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid #d8c8b2",
                  background: "#fffdf9",
                  padding: "14px 16px",
                }}
              >
                <div style={{ color: "#8a7156", fontSize: 12, fontWeight: 900, marginBottom: 6 }}>
                  자산 유형
                </div>
                <div style={{ color: "#2f2417", fontSize: 14, fontWeight: 800 }}>
                  {listing.category || "-"}
                </div>
              </div>
            </section>

            {!isOwner && listing.status !== "sold" ? (
              <form action="/api/deals/create" method="post">
                <input type="hidden" name="listing_id" value={listing.id} />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 999,
                    border: "none",
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  거래 문의 시작
                </button>
              </form>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}