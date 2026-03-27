import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CategoryBadge,
  getCategoryLabel,
} from "@/components/listings/CategoryVisual";

type DealRow = {
  id: string;
  listing_id: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ListingRow = {
  id: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  status?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
};

type NotificationRow = {
  id: string;
  deal_id?: string | null;
  is_read?: boolean | null;
};

const DEAL_STATUS_LABEL: Record<string, string> = {
  open: "진행중",
  active: "진행중",
  pending: "대기중",
  reserved: "예약중",
  completed: "완료",
  closed: "종료",
  cancelled: "취소",
};

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "가격협의";
  const num = Number(value);
  if (Number.isNaN(num)) return "가격협의";
  return `${num.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getDealStatusLabel(status: string | null | undefined) {
  if (!status) return "진행중";
  return DEAL_STATUS_LABEL[status] || status;
}

function getImage(row?: ListingRow | null) {
  if (!row) return null;
  return row.thumbnail_url || row.image_url || row.cover_image_url || null;
}

export default async function MyDealsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my/deals");
  }

  const { data: dealsData, error: dealsError } = await supabase
    .from("deals")
    .select("*")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  const deals: DealRow[] = Array.isArray(dealsData) ? (dealsData as DealRow[]) : [];

  const listingIds = Array.from(
    new Set(deals.map((deal) => deal.listing_id).filter(Boolean))
  ) as string[];

  const { data: listingsData } =
    listingIds.length > 0
      ? await supabase.from("listings").select("*").in("id", listingIds)
      : { data: [] as ListingRow[] };

  const listingsMap = new Map<string, ListingRow>(
    ((listingsData || []) as ListingRow[]).map((item) => [item.id, item])
  );

  const dealIds = deals.map((deal) => deal.id);

  const { data: notificationsData } =
    dealIds.length > 0
      ? await supabase
          .from("notifications")
          .select("id, deal_id, is_read")
          .eq("user_id", user.id)
          .in("deal_id", dealIds)
      : { data: [] as NotificationRow[] };

  const unreadCountByDeal = new Map<string, number>();

  for (const row of (notificationsData || []) as NotificationRow[]) {
    if (!row.deal_id || row.is_read) continue;
    unreadCountByDeal.set(row.deal_id, (unreadCountByDeal.get(row.deal_id) || 0) + 1);
  }

  const totalCount = deals.length;
  const activeCount = deals.filter((deal) =>
    ["open", "active", "pending", null, undefined].includes(
      deal.status as string | null | undefined
    )
  ).length;
  const reservedCount = deals.filter((deal) => deal.status === "reserved").length;
  const completedCount = deals.filter((deal) =>
    ["completed", "closed"].includes(deal.status || "")
  ).length;

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
            className="msell-mydeals-top"
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
                MY DEALS
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
                내 거래
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
          className="msell-mydeals-kpis"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {[
            { label: "전체", value: totalCount },
            { label: "진행중", value: activeCount },
            { label: "예약중", value: reservedCount },
            { label: "완료", value: completedCount },
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

        {dealsError ? (
          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 20,
              padding: 18,
              color: "#9a3412",
            }}
          >
            거래 목록을 불러오지 못했습니다.
          </section>
        ) : deals.length === 0 ? (
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
            진행 중인 거래가 없습니다.
          </section>
        ) : (
          <div className="msell-mydeals-grid">
            {deals.map((deal) => {
              const listing = deal.listing_id
                ? listingsMap.get(deal.listing_id) || null
                : null;
              const unread = unreadCountByDeal.get(deal.id) || 0;
              const image = getImage(listing);
              const isBuyer = !!deal.buyer_id && deal.buyer_id === user.id;
              const roleLabel = isBuyer ? "구매자" : "판매자";

              return (
                <Link
                  key={deal.id}
                  href={`/deal/${deal.id}`}
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
                      aspectRatio: "1 / 0.62",
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
                        category={listing?.category}
                        label={getCategoryLabel(listing?.category)}
                        mode="ghost"
                        size="sm"
                      />
                    </div>

                    {unread > 0 ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 26,
                          height: 26,
                          padding: "0 8px",
                          borderRadius: 999,
                          background: "#2f2417",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 900,
                          boxShadow: "0 8px 18px rgba(47,36,23,0.16)",
                        }}
                      >
                        {unread}
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      padding: 14,
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
                        {getDealStatusLabel(deal.status)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#8a7357",
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(deal.updated_at || deal.created_at)}
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
                        letterSpacing: "-0.02em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {listing?.title || "연결된 자산 없음"}
                    </div>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#2f2417",
                        marginBottom: 10,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {formatPrice(listing?.price)}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#8a7357", fontWeight: 700 }}>역할</span>
                        <span style={{ color: "#241b11", fontWeight: 800 }}>
                          {roleLabel}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#8a7357", fontWeight: 700 }}>카테고리</span>
                        <CategoryBadge
                          category={listing?.category}
                          label={getCategoryLabel(listing?.category)}
                          mode="light"
                          size="sm"
                        />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#8a7357", fontWeight: 700 }}>메시지</span>
                        <span style={{ color: "#241b11", fontWeight: 800 }}>
                          {unread > 0 ? `${unread}건 미확인` : "확인됨"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <style>{`
          .msell-mydeals-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
          }

          .msell-mydeals-grid > a:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 28px rgba(47, 36, 23, 0.09);
            border-color: #d8c4aa;
          }

          @media (max-width: 1540px) {
            .msell-mydeals-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 1240px) {
            .msell-mydeals-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .msell-mydeals-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 820px) {
            .msell-mydeals-top {
              grid-template-columns: 1fr !important;
              align-items: stretch !important;
            }
          }

          @media (max-width: 760px) {
            .msell-mydeals-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }
          }

          @media (max-width: 560px) {
            .msell-mydeals-grid {
              grid-template-columns: 1fr;
            }

            .msell-mydeals-kpis {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}