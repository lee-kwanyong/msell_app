import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

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

const CATEGORY_LABEL: Record<string, string> = {
  instagram: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
  x: "X",
  thread: "스레드",
  website: "웹사이트",
  ecommerce: "쇼핑몰",
  blog: "블로그",
  community: "커뮤니티",
  digital_product: "디지털상품",
  domain: "도메인",
  app: "앱",
  etc: "기타",
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

function getCategoryLabel(category: string | null) {
  if (!category) return "기타";
  return CATEGORY_LABEL[category] || category;
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
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 22,
            padding: "16px 18px",
            boxShadow: "0 8px 24px rgba(47,36,23,0.05)",
            marginBottom: 12,
          }}
        >
          <div
            className="msell-listings-toolbar"
            style={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr) auto auto auto",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                minWidth: 180,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#8a7357",
                  marginBottom: 4,
                }}
              >
                MSELL LISTINGS
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.15,
                  color: "#241b11",
                  fontWeight: 800,
                }}
              >
                거래 가능한 자산
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
                placeholder="제목 또는 설명 검색"
                style={{
                  height: 42,
                  borderRadius: 12,
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
                  height: 42,
                  borderRadius: 12,
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
                <option value="instagram">인스타그램</option>
                <option value="youtube">유튜브</option>
                <option value="tiktok">틱톡</option>
                <option value="x">X</option>
                <option value="thread">스레드</option>
                <option value="website">웹사이트</option>
                <option value="ecommerce">쇼핑몰</option>
                <option value="blog">블로그</option>
                <option value="community">커뮤니티</option>
                <option value="digital_product">디지털상품</option>
                <option value="domain">도메인</option>
                <option value="app">앱</option>
                <option value="etc">기타</option>
              </select>

              <button
                type="submit"
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid #decfbc",
                  background: "#eadfcf",
                  color: "#2f2417",
                  padding: "0 16px",
                  fontSize: 14,
                  fontWeight: 700,
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
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                background: "#2f2417",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              자산 등록
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
              borderRadius: 20,
              padding: 24,
              textAlign: "center",
              color: "#6e5a43",
            }}
          >
            등록된 자산이 없습니다.
          </section>
        ) : (
          <>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#6e5a43",
                  fontWeight: 700,
                }}
              >
                총 {listings.length}개
              </div>
            </div>

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
                      borderRadius: 18,
                      overflow: "hidden",
                      textDecoration: "none",
                      color: "inherit",
                      boxShadow: "0 8px 22px rgba(47,36,23,0.05)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
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
                          top: 8,
                          left: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          height: 24,
                          padding: "0 8px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.94)",
                          color: "#2f2417",
                          fontSize: 11,
                          fontWeight: 800,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {getCategoryLabel(item.category)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 8,
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
                            fontWeight: 700,
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
                          minHeight: 38,
                          fontSize: 14,
                          lineHeight: 1.4,
                          fontWeight: 800,
                          color: "#241b11",
                          marginBottom: 8,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title || "제목 없음"}
                      </div>

                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 900,
                          color: "#2f2417",
                          marginBottom: 8,
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
                        {item.description || "상세 설명이 아직 등록되지 않았습니다."}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        .msell-listings-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 1600px) {
          .msell-listings-toolbar {
            grid-template-columns: auto minmax(0, 1fr) auto !important;
          }
        }

        @media (max-width: 1400px) {
          .msell-listings-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .msell-listings-search {
            grid-template-columns: minmax(0, 1fr) 180px auto !important;
          }
        }

        @media (max-width: 1180px) {
          .msell-listings-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .msell-listings-toolbar {
            grid-template-columns: 1fr !important;
            align-items: stretch !important;
          }
        }

        @media (max-width: 920px) {
          .msell-listings-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

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
    </main>
  );
}