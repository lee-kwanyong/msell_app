import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CategoryBadge,
  getCategoryLabel,
} from "@/components/listings/CategoryVisual";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

type ListingRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  description: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  pending_review: "검수대기",
  active: "거래가능",
  reserved: "예약중",
  sold: "거래종료",
  hidden: "숨김",
  rejected: "반려",
  archived: "보관됨",
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "가격협의";
  const num = Number(value);
  if (Number.isNaN(num)) return "가격협의";
  return `${num.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getImage(listing: ListingRow) {
  return listing.thumbnail_url || listing.image_url || listing.cover_image_url || null;
}

function getStatusLabel(status: string | null) {
  if (!status) return "상태미정";
  return STATUS_LABEL[status] || status;
}

function extractTransferMethod(description: string | null) {
  if (!description) {
    return {
      transferMethod: "",
      cleanDescription: "",
    };
  }

  const match = description.match(/^\[이전 방식\]\s*(.+?)\n\n/s);

  if (!match) {
    return {
      transferMethod: "",
      cleanDescription: description.trim(),
    };
  }

  const transferMethod = match[1]?.trim() || "";
  const cleanDescription = description
    .replace(/^\[이전 방식\]\s*.+?\n\n/s, "")
    .trim();

  return {
    transferMethod,
    cleanDescription,
  };
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "unauthorized":
      return "권한이 없습니다.";
    case "missing_required_fields":
      return "필수 정보가 누락되었습니다.";
    case "cannot_deal_with_own_listing":
      return "본인 자산에는 거래 문의를 시작할 수 없습니다.";
    case "listing_not_found":
      return "자산을 찾을 수 없습니다.";
    case "deal_create_failed":
      return "거래 문의 시작에 실패했습니다.";
    default:
      return "";
  }
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = (await searchParams) || {};
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const listing = data as ListingRow;
  const image = getImage(listing);
  const isOwner = !!user && !!listing.user_id && user.id === listing.user_id;
  const errorMessage = getErrorMessage(query.error);
  const { transferMethod, cleanDescription } = extractTransferMethod(
    listing.description || ""
  );

  const canInquire =
    listing.status === "active" || listing.status === "reserved";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "20px 16px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
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
              borderRadius: 14,
              background: "#fff",
              border: "1px solid #eadfcf",
              color: "#2f2417",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            거래목록
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
                borderRadius: 14,
                background: "#eadfcf",
                border: "1px solid #decfbc",
                color: "#2f2417",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              수정하기
            </Link>
          ) : null}
        </div>

        {errorMessage ? (
          <section
            style={{
              background: "#fff5f2",
              border: "1px solid #f0c7b6",
              color: "#9a3412",
              borderRadius: 18,
              padding: "14px 16px",
              marginBottom: 14,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {errorMessage}
          </section>
        ) : null}

        <section
          className="msell-detail-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.18fr) 420px",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 26,
              overflow: "hidden",
              boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
            }}
          >
            <div
              style={{
                aspectRatio: "1 / 0.64",
                background: image
                  ? `url(${image}) center/cover no-repeat`
                  : "linear-gradient(135deg, #f4ece0 0%, #efe4d3 100%)",
                borderBottom: "1px solid #f0e5d6",
              }}
            />

            <div
              style={{
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <CategoryBadge
                  category={listing.category}
                  label={getCategoryLabel(listing.category)}
                  mode="light"
                  size="md"
                />

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 30,
                    padding: "0 12px",
                    borderRadius: 999,
                    background: "#f8f4ed",
                    color: "#6b543c",
                    border: "1px solid #eadfcf",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {getStatusLabel(listing.status)}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    color: "#8a7357",
                    fontWeight: 600,
                  }}
                >
                  {formatDate(listing.created_at)}
                </span>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 38,
                  lineHeight: 1.08,
                  color: "#241b11",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  wordBreak: "keep-all",
                }}
              >
                {listing.title || "제목 없음"}
              </h1>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 32,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: "#2f2417",
                  letterSpacing: "-0.04em",
                }}
              >
                {formatPrice(listing.price)}
              </div>

              {(transferMethod || cleanDescription) ? (
                <div
                  style={{
                    marginTop: 28,
                    display: "grid",
                    gap: 18,
                  }}
                >
                  {transferMethod ? (
                    <div
                      style={{
                        background: "#fcfaf6",
                        border: "1px solid #efe3d1",
                        borderRadius: 18,
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#8a7357",
                          marginBottom: 8,
                          letterSpacing: "0.08em",
                        }}
                      >
                        TRANSFER METHOD
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: "#241b11",
                          fontWeight: 700,
                          wordBreak: "keep-all",
                        }}
                      >
                        {transferMethod}
                      </div>
                    </div>
                  ) : null}

                  {cleanDescription ? (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #efe3d1",
                        borderRadius: 18,
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#8a7357",
                          marginBottom: 10,
                          letterSpacing: "0.08em",
                        }}
                      >
                        DESCRIPTION
                      </div>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: 15,
                          lineHeight: 1.75,
                          color: "#49382a",
                        }}
                      >
                        {cleanDescription}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <aside
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <section
              style={{
                background: "#fff",
                border: "1px solid #eadfcf",
                borderRadius: 24,
                padding: 22,
                boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: "#8a7357",
                    }}
                  >
                    PRICE
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      fontWeight: 900,
                      color: "#241b11",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {formatPrice(listing.price)}
                  </div>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#f0e5d6",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#7a654d", fontWeight: 700 }}>상태</span>
                  <span style={{ color: "#241b11", fontWeight: 800 }}>
                    {getStatusLabel(listing.status)}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#7a654d", fontWeight: 700 }}>카테고리</span>
                  <CategoryBadge
                    category={listing.category}
                    label={getCategoryLabel(listing.category)}
                    mode="light"
                    size="sm"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#7a654d", fontWeight: 700 }}>등록일</span>
                  <span style={{ color: "#241b11", fontWeight: 800 }}>
                    {formatDate(listing.created_at)}
                  </span>
                </div>

                {!isOwner ? (
                  canInquire ? (
                    <form action="/api/deals/create" method="post">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input
                        type="hidden"
                        name="return_to"
                        value={`/listings/${listing.id}`}
                      />
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          height: 52,
                          border: 0,
                          borderRadius: 16,
                          background: "#2f2417",
                          color: "#fff",
                          fontSize: 15,
                          fontWeight: 900,
                          cursor: "pointer",
                          marginTop: 6,
                          boxShadow: "0 14px 24px rgba(47,36,23,0.14)",
                        }}
                      >
                        거래 문의 시작
                      </button>
                    </form>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 52,
                        borderRadius: 16,
                        background: "#f4ece0",
                        color: "#8a7357",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 800,
                        marginTop: 6,
                      }}
                    >
                      거래가 종료된 자산입니다
                    </div>
                  )
                ) : (
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: 52,
                      borderRadius: 16,
                      background: "#eadfcf",
                      color: "#2f2417",
                      textDecoration: "none",
                      fontSize: 15,
                      fontWeight: 900,
                      marginTop: 6,
                      border: "1px solid #decfbc",
                    }}
                  >
                    자산 수정
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </section>

        <style>{`
          @media (max-width: 1100px) {
            .msell-detail-layout {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 720px) {
            .msell-detail-layout h1 {
              font-size: 30px !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}