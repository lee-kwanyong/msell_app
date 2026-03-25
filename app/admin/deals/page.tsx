import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type ProfileRow = {
  id?: string | null;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
};

type ListingRow = {
  id: string | number;
  title?: string | null;
  category?: string | null;
};

type DealRow = {
  id: string | number;
  listing_id?: string | number | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusMeta(status?: string | null) {
  switch (status) {
    case "active":
      return {
        label: "진행중",
        bg: "#eef8ee",
        border: "#cfe6cf",
        color: "#25613a",
      };
    case "inquiry":
      return {
        label: "문의중",
        bg: "#fff8ea",
        border: "#eddca8",
        color: "#8b6a14",
      };
    case "completed":
      return {
        label: "거래완료",
        bg: "#edf5ff",
        border: "#cfe0f6",
        color: "#2f5f93",
      };
    case "cancelled":
      return {
        label: "취소됨",
        bg: "#f8eded",
        border: "#ebcfcf",
        color: "#8f3b3b",
      };
    case "disputed":
      return {
        label: "분쟁",
        bg: "#f9eeee",
        border: "#eccfcf",
        color: "#962f2f",
      };
    default:
      return {
        label: "거래방",
        bg: "#f6f1ea",
        border: "#e6d8c7",
        color: "#6a5743",
      };
  }
}

function getDisplayName(profile?: ProfileRow | null) {
  return (
    profile?.username ||
    profile?.full_name ||
    profile?.email ||
    "사용자"
  );
}

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const pageParams = searchParams ? await searchParams : undefined;
  const error = pageParams?.error ?? "";
  const success = pageParams?.success ?? "";

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/deals");
  }

  const [{ data: meRaw }, { data: adminCheckRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.rpc("is_admin"),
  ]);

  const me = (meRaw as ProfileRow | null) ?? null;
  const isAdmin =
    adminCheckRaw === true ||
    me?.role === "admin";

  if (!isAdmin) {
    redirect(
      `/?error=${encodeURIComponent("관리자만 접근할 수 있습니다.")}`
    );
  }

  const { data: dealsRaw } = await supabase
    .from("deals")
    .select("*")
    .order("updated_at", { ascending: false });

  const deals = Array.isArray(dealsRaw)
    ? (dealsRaw as DealRow[])
    : [];

  const userIds = Array.from(
    new Set(
      [
        ...deals.map((item) => String(item.buyer_id ?? "").trim()),
        ...deals.map((item) => String(item.seller_id ?? "").trim()),
      ].filter(Boolean)
    )
  );

  const listingIds = Array.from(
    new Set(
      deals.map((item) => String(item.listing_id ?? "").trim()).filter(Boolean)
    )
  );

  const [profilesResult, listingsResult] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("*").in("id", userIds)
      : Promise.resolve({ data: [] }),
    listingIds.length > 0
      ? supabase.from("listings").select("*").in("id", listingIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profiles = Array.isArray(profilesResult.data)
    ? (profilesResult.data as ProfileRow[])
    : [];
  const listings = Array.isArray(listingsResult.data)
    ? (listingsResult.data as ListingRow[])
    : [];

  const profileMap = new Map<string, ProfileRow>();
  for (const profile of profiles) {
    if (profile.id) {
      profileMap.set(String(profile.id), profile);
    }
  }

  const listingMap = new Map<string, ListingRow>();
  for (const listing of listings) {
    listingMap.set(String(listing.id), listing);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "40px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#8a6f52",
                marginBottom: 8,
              }}
            >
              ADMIN DEALS
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.2,
                color: "#241b11",
                fontWeight: 900,
              }}
            >
              거래 관리
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#6a5743",
              }}
            >
              거래 상태를 확인하고 문의중/진행중/완료/취소/분쟁 상태를 관리합니다.
            </p>
          </div>

          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              borderRadius: 14,
              background: "#eadfcf",
              color: "#2f2417",
              minHeight: 52,
              padding: "0 18px",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            대시보드로
          </Link>
        </div>

        {error ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#fff4f2",
              border: "1px solid #f1d0c8",
              color: "#9a3f2d",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#f4fbf4",
              border: "1px solid #d5ead5",
              color: "#2f6b3d",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {decodeURIComponent(success)}
          </div>
        ) : null}

        <section
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1px solid #eee4d6",
            boxShadow: "0 10px 30px rgba(47, 36, 23, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid #efe5d7",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#241b11",
                }}
              >
                전체 거래
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#6b5845",
                }}
              >
                최근 업데이트 순으로 표시됩니다.
              </p>
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#8a6f52",
              }}
            >
              총 {deals.length}건
            </div>
          </div>

          {deals.length === 0 ? (
            <div
              style={{
                padding: "36px 24px",
                textAlign: "center",
                color: "#6b5845",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              표시할 거래가 없습니다.
            </div>
          ) : (
            <div style={{ display: "grid" }}>
              {deals.map((deal, index) => {
                const statusMeta = getStatusMeta(deal.status);
                const buyer = profileMap.get(String(deal.buyer_id ?? ""));
                const seller = profileMap.get(String(deal.seller_id ?? ""));
                const listing = listingMap.get(String(deal.listing_id ?? ""));

                return (
                  <div
                    key={String(deal.id)}
                    style={{
                      padding: "22px 24px",
                      borderTop: index === 0 ? "none" : "1px solid #f1e7d8",
                      display: "grid",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "7px 12px",
                              borderRadius: 999,
                              background: statusMeta.bg,
                              border: `1px solid ${statusMeta.border}`,
                              color: statusMeta.color,
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {statusMeta.label}
                          </span>

                          <Link
                            href={`/deal/${deal.id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                              borderRadius: 999,
                              background: "#f7f1e8",
                              border: "1px solid #eadfcf",
                              color: "#2f2417",
                              minHeight: 30,
                              padding: "0 12px",
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            거래방 보기
                          </Link>
                        </div>

                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: "#241b11",
                            wordBreak: "keep-all",
                          }}
                        >
                          {listing?.title || `거래 #${deal.id}`}
                        </div>

                        <div
                          className="msell-admin-deal-meta"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <MetaLine label="구매자" value={getDisplayName(buyer)} />
                          <MetaLine label="판매자" value={getDisplayName(seller)} />
                          <MetaLine label="카테고리" value={listing?.category || "-"} />
                          <MetaLine label="수정일" value={formatDateTime(deal.updated_at || deal.created_at)} />
                        </div>
                      </div>

                      <form
                        action="/api/admin/deals/status"
                        method="post"
                        style={{
                          display: "grid",
                          gap: 10,
                          minWidth: 190,
                        }}
                      >
                        <input
                          type="hidden"
                          name="deal_id"
                          value={String(deal.id)}
                        />
                        <input
                          type="hidden"
                          name="next"
                          value="/admin/deals"
                        />

                        <select
                          name="status"
                          defaultValue={String(deal.status ?? "inquiry")}
                          style={{
                            width: "100%",
                            minHeight: 46,
                            borderRadius: 14,
                            border: "1px solid #ddcfba",
                            background: "#fffdf9",
                            padding: "0 14px",
                            fontSize: 14,
                            color: "#241b11",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="inquiry">문의중</option>
                          <option value="active">진행중</option>
                          <option value="completed">거래완료</option>
                          <option value="cancelled">취소됨</option>
                          <option value="disputed">분쟁</option>
                        </select>

                        <button
                          type="submit"
                          style={{
                            border: "none",
                            borderRadius: 14,
                            minHeight: 46,
                            padding: "0 16px",
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "#2f2417",
                            color: "#ffffff",
                          }}
                        >
                          상태 저장
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          @media (max-width: 760px) {
            .msell-admin-deal-meta {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </main>
  );
}

function MetaLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "72px minmax(0, 1fr)",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#8a6f52",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#2f2417",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}