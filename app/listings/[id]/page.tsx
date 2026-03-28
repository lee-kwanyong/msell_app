import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#e9dece",
                  color: "#845f3b",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
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
                {listing.price_negotiable ? "금액협의 가능" : "금액협의 불가"}
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