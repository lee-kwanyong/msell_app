import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CategoryBadge,
  getCategoryLabel,
} from "@/components/listings/CategoryVisual";

type ListingRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  updated_at?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  description?: string | null;
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

function getImage(row: ListingRow) {
  return row.thumbnail_url || row.image_url || row.cover_image_url || null;
}

function getStatusLabel(status: string | null) {
  if (!status) return "상태미정";
  return STATUS_LABEL[status] || status;
}

export default async function MyListingsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my/listings");
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings: ListingRow[] = Array.isArray(data) ? (data as ListingRow[]) : [];

  const totalCount = listings.length;
  const activeCount = listings.filter((item) => item.status === "active").length;
  const reservedCount = listings.filter((item) => item.status === "reserved").length;
  const soldCount = listings.filter((item) => item.status === "sold").length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
      }}
    >
      <div
        style={{
          maxWidth: 1680,
          margin: "0 auto",
          padding: "20px 16px 56px",
        }}
      >
        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid #e6dac8",
            borderRadius: 24,
            padding: 16,
            boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
            backdropFilter: "blur(10px)",
            marginBottom: 14,
          }}
        >
          <div
            className="msell-mylistings-top"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#8a7357",
                  marginBottom: 4,
                }}
              >
                MY LISTINGS
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.08,
                  color: "#241b11",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                내 자산
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
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
                  whiteSpace: "nowrap",
                }}
              >
                거래목록
              </Link>

              <Link
                href="/listings/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 14,
                  background: "#2f2417",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 20px rgba(47,36,23,0.12)",
                }}
              >
                새 자산 등록
              </Link>
            </div>
          </div>
        </section>

        <section
          className="msell-mylistings-kpis"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {[
            { label: "전체", value: totalCount },
            { label: "거래가능", value: activeCount },
            { label: "예약중", value: reservedCount },
            { label: "거래종료", value: soldCount },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#fff",
                border: "1px solid #eadfcf",
                borderRadius: 20,
                padding: "18px 18px 16px",
                boxShadow: "0 8px 22px rgba(47,36,23,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#8a7357",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                {item.label}
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
                {item.value}
              </div>
            </div>
          ))}
        </section>

        {error ? (
          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 20,
              padding: 18,
              color: "#9a3412",
            }}
          >
            자산 목록을 불러오지 못했습니다.
          </section>
        ) : listings.length === 0 ? (
          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 22,
              padding: 28,
              textAlign: "center",
              color: "#6e5a43",
              boxShadow: "0 8px 22px rgba(47,36,23,0.04)",
            }}
          >
            아직 등록한 자산이 없습니다.
          </section>
        ) : (
          <div className="msell-mylistings-grid">
            {listings.map((item) => {
              const image = getImage(item);

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #eadfcf",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 8px 22px rgba(47,36,23,0.05)",
                  }}
                >
                  <Link
                    href={`/listings/${item.id}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "1 / 0.72",
                        background: image
                          ? `url(${image}) center/cover no-repeat`
                          : "linear-gradient(135deg, #f4ece0 0%, #efe4d3 100%)",
                        borderBottom: "1px solid #f0e5d6",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                        }}
                      >
                        <CategoryBadge
                          category={item.category}
                          label={getCategoryLabel(item.category)}
                          mode="ghost"
                          size="sm"
                        />
                      </div>
                    </div>
                  </Link>

                  <div
                    style={{
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 9,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: 22,
                          padding: "0 8px",
                          borderRadius: 999,
                          background: "#f5eee3",
                          color: "#6b543c",
                          fontSize: 11,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#8a7357",
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <Link
                      href={`/listings/${item.id}`}
                      style={{
                        display: "block",
                        minHeight: 40,
                        fontSize: 14,
                        lineHeight: 1.42,
                        fontWeight: 800,
                        color: "#241b11",
                        marginBottom: 8,
                        textDecoration: "none",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title || "제목 없음"}
                      </span>
                    </Link>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#2f2417",
                        marginBottom: 10,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <Link
                        href={`/listings/${item.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 40,
                          borderRadius: 12,
                          background: "#fff",
                          border: "1px solid #eadfcf",
                          color: "#2f2417",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        상세보기
                      </Link>

                      <Link
                        href={`/listings/${item.id}/edit`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 40,
                          borderRadius: 12,
                          background: "#eadfcf",
                          border: "1px solid #decfbc",
                          color: "#2f2417",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        수정하기
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          .msell-mylistings-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
          }

          @media (max-width: 1540px) {
            .msell-mylistings-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 1240px) {
            .msell-mylistings-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .msell-mylistings-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 820px) {
            .msell-mylistings-top {
              grid-template-columns: 1fr !important;
              align-items: stretch !important;
            }
          }

          @media (max-width: 760px) {
            .msell-mylistings-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }
          }

          @media (max-width: 560px) {
            .msell-mylistings-grid {
              grid-template-columns: 1fr;
            }

            .msell-mylistings-kpis {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}