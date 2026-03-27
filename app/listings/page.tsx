import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CATEGORY_LABEL,
  CategoryBadge,
  getCategoryLabel,
} from "@/components/listings/CategoryVisual";

type SearchParams = {
  q?: string;
  category?: string;
};

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  seller_name?: string | null;
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
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
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

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const q = (params.q || "").trim();
  const category = (params.category || "").trim();

  const supabase = await supabaseServer();

  let query = supabase
    .from("listings")
    .select("*")
    .in("status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.limit(120);

  const listings: ListingRow[] = Array.isArray(data) ? (data as ListingRow[]) : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
      }}
    >
      <div
        style={{
          maxWidth: 1720,
          margin: "0 auto",
          padding: "20px 16px 48px",
        }}
      >
        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid #e6dac8",
            borderRadius: 24,
            padding: "16px",
            boxShadow: "0 10px 28px rgba(47,36,23,0.05)",
            backdropFilter: "blur(10px)",
            marginBottom: 14,
          }}
        >
          <div
            className="msell-listings-toolbar"
            style={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#8a7357",
                  marginBottom: 4,
                }}
              >
                MSELL MARKET
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.1,
                  color: "#241b11",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                거래목록
              </h1>
            </div>

            <form
              action="/listings"
              method="get"
              className="msell-listings-search"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 220px auto",
                gap: 8,
                alignItems: "center",
                width: "100%",
              }}
            >
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="검색"
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid #decfbc",
                  background: "#fcfaf6",
                  padding: "0 14px",
                  fontSize: 14,
                  outline: "none",
                  color: "#241b11",
                  width: "100%",
                }}
              />

              <select
                name="category"
                defaultValue={category}
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid #decfbc",
                  background: "#fcfaf6",
                  padding: "0 12px",
                  fontSize: 14,
                  outline: "none",
                  color: "#241b11",
                  width: "100%",
                }}
              >
                <option value="">전체 카테고리</option>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid #decfbc",
                  background: "#eadfcf",
                  color: "#2f2417",
                  padding: "0 16px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                검색
              </button>
            </form>

            <Link
              href="/listings/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 18px",
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
              등록하기
            </Link>
          </div>
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
            목록을 불러오지 못했습니다.
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
            등록된 자산이 없습니다.
          </section>
        ) : (
          <div className="msell-listings-grid">
            {listings.map((item) => {
              const image = getImage(item);

              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    display: "block",
                    background: "#ffffff",
                    border: "1px solid #eadfcf",
                    borderRadius: 20,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    boxShadow: "0 8px 22px rgba(47,36,23,0.05)",
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
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

                    <div
                      style={{
                        minHeight: 40,
                        fontSize: 14,
                        lineHeight: 1.42,
                        fontWeight: 800,
                        color: "#241b11",
                        marginBottom: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.title || "제목 없음"}
                    </div>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#2f2417",
                        marginBottom: 6,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>

                    <div
                      style={{
                        minHeight: 32,
                        fontSize: 12,
                        lineHeight: 1.45,
                        color: "#7a654d",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description || ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <style>{`
          .msell-listings-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
          }

          @media (max-width: 1540px) {
            .msell-listings-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 1240px) {
            .msell-listings-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .msell-listings-toolbar {
              grid-template-columns: 1fr !important;
              align-items: stretch !important;
            }
          }

          @media (max-width: 900px) {
            .msell-listings-search {
              grid-template-columns: 1fr 1fr auto !important;
            }
          }

          @media (max-width: 760px) {
            .msell-listings-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }

            .msell-listings-search {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 520px) {
            .msell-listings-grid {
              grid-template-columns: 1fr;
            }
          }

          .msell-listings-grid > a:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 28px rgba(47, 36, 23, 0.09);
            border-color: #d8c4aa;
          }
        `}</style>
      </div>
    </main>
  );
}