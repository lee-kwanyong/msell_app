import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatPrice(value: number | string | null | undefined) {
  const price =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;

  if (!Number.isFinite(price)) return "-";
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function decodeValue(value?: string) {
  return value ? decodeURIComponent(value) : "";
}

function extractTransferMethod(description?: string | null) {
  if (!description) return "-";
  const match = description.match(/^\[이전 방식\]\s*(.+)$/m);
  return match?.[1]?.trim() || "-";
}

function extractDescriptionBody(description?: string | null) {
  if (!description) return "-";
  const cleaned = description.replace(/^\[이전 방식\]\s*.+\n\n?/m, "").trim();
  return cleaned || "-";
}

function pickOwnerId(listing: Record<string, any>) {
  return (
    listing.seller_id ||
    listing.user_id ||
    listing.owner_id ||
    listing.profile_id ||
    null
  );
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const error = decodeValue(query?.error);
  const success = decodeValue(query?.success);

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (listingError || !listing) {
    redirect("/listings");
  }

  const category =
    typeof listing.category === "string" && listing.category.trim()
      ? listing.category
      : "기타";

  const title =
    typeof listing.title === "string" && listing.title.trim()
      ? listing.title
      : "제목 없음";

  const status =
    typeof listing.status === "string" && listing.status.trim()
      ? listing.status
      : "-";

  const transferMethod = extractTransferMethod(
    typeof listing.description === "string" ? listing.description : ""
  );

  const description = extractDescriptionBody(
    typeof listing.description === "string" ? listing.description : ""
  );

  const sellerId = pickOwnerId(listing);
  const isOwner = !!user && !!sellerId && user.id === sellerId;

  let inquiryCount = 0;
  const { count } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", id);

  inquiryCount = count || 0;

  const statusLabelMap: Record<string, string> = {
    active: "거래가능",
    draft: "임시저장",
    hidden: "숨김",
    sold: "거래종료",
    reserved: "예약중",
    pending_review: "검토중",
    rejected: "반려",
    archived: "보관됨",
  };

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
            marginBottom: 18,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            color: "#8a7156",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Link
            href="/listings"
            style={{ color: "#8a7156", textDecoration: "none" }}
          >
            ← 목록으로
          </Link>
          <span>/</span>
          <span>상세 보기</span>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 18,
              border: "1px solid #efc0c0",
              background: "#fff4f4",
              color: "#b42318",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {error === "failed_to_create_deal"
              ? "거래 문의방 생성에 실패했습니다. 다시 시도해 주세요."
              : error === "cannot_deal_with_own_listing"
              ? "본인 매물에는 거래 문의를 시작할 수 없습니다."
              : error === "missing_seller_id"
              ? "판매자 정보가 연결되지 않았습니다. 매물 데이터를 확인해 주세요."
              : error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 18,
              border: "1px solid #cfe3c7",
              background: "#f5fbf2",
              color: "#2f6b2f",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {success}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.9fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 34,
              padding: 18,
              boxShadow: "0 18px 40px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "#f2e8db",
                    color: "#8a7156",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  📦
                </span>
                <span
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 999,
                    background: "#f5efe5",
                    color: "#6f5b46",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {category}
                </span>
              </div>

              <span
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#e9f8ec",
                  color: "#3f8a53",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {statusLabelMap[status] || status}
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: "#16110d",
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              {title}
            </h1>

            <div
              style={{
                marginTop: 16,
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, #2b1d12 0%, #4a2f1b 52%, #77502d 100%)",
                color: "#fffaf2",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                희망 가격
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                {formatPrice(listing.price)}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  이전 방식
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 16,
                    fontWeight: 800,
                    wordBreak: "break-word",
                  }}
                >
                  {transferMethod}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  등록일
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {formatDate(listing.created_at)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  문의 수
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {inquiryCount}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 22,
                background: "#fffdf9",
                border: "1px solid #eadfcf",
                padding: 18,
              }}
            >
              <div
                style={{
                  color: "#16110d",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 10,
                }}
              >
                자산 설명
              </div>
              <div
                style={{
                  color: "#6d5945",
                  fontSize: 14,
                  lineHeight: 1.8,
                  fontWeight: 600,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {description}
              </div>
            </div>
          </section>

          <aside
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <section
              style={{
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  color: "#16110d",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                거래 액션
              </div>

              <div
                style={{
                  color: "#8a7156",
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                관심이 있다면 바로 거래 문의를 시작하고, 등록자라면 자산 내용을 수정할 수 있습니다.
              </div>

              {isOwner ? (
                <Link
                  href={`/listings/${id}/edit`}
                  style={{
                    width: "100%",
                    minHeight: 54,
                    borderRadius: 18,
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
                  자산 수정
                </Link>
              ) : (
                <form method="post" action="/api/deals/create">
                  <input type="hidden" name="listing_id" value={id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={`/listings/${id}`}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      minHeight: 54,
                      borderRadius: 18,
                      border: 0,
                      background: "#2f2417",
                      color: "#fffaf2",
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 12px 24px rgba(47, 36, 23, 0.18)",
                    }}
                  >
                    거래 문의 시작
                  </button>
                </form>
              )}
            </section>

            <section
              style={{
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  color: "#16110d",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 12,
                }}
              >
                요약 정보
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["카테고리", category],
                  ["상태", statusLabelMap[status] || status],
                  ["조회수", String(listing.view_count || 0)],
                  ["수정일", formatDate(listing.updated_at || listing.created_at)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "92px 1fr",
                      gap: 8,
                      alignItems: "center",
                      paddingBottom: 10,
                      borderBottom: "1px solid #f0e6d9",
                    }}
                  >
                    <div
                      style={{
                        color: "#8a7156",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: "#24190f",
                        fontSize: 13,
                        fontWeight: 800,
                        textAlign: "right",
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}