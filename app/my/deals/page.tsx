import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealRow = {
  id?: string;
  listing_id?: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ListingRow = {
  id?: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  status?: string | null;
};

type NotificationRow = {
  id?: string;
  deal_id?: string | null;
  is_read?: boolean | null;
};

const DEAL_STATUS_LABEL: Record<string, string> = {
  pending: "진행중",
  active: "진행중",
  completed: "완료",
  cancelled: "취소",
  closed: "종료",
};

const DEAL_STATUS_TONE: Record<string, React.CSSProperties> = {
  pending: {
    background: "#fff3dd",
    color: "#946200",
    border: "1px solid #f1ddab",
  },
  active: {
    background: "#edf8ef",
    color: "#1d8a43",
    border: "1px solid #cae9d2",
  },
  completed: {
    background: "#eef4ff",
    color: "#2d64c8",
    border: "1px solid #d6e3ff",
  },
  cancelled: {
    background: "#fff0f0",
    color: "#b23a3a",
    border: "1px solid #f1cfcf",
  },
  closed: {
    background: "#f3f1f7",
    color: "#6b5c88",
    border: "1px solid #ddd6eb",
  },
};

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "가격 미정";
  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(num)) return String(value);
  return `₩${num.toLocaleString("ko-KR")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function getDealStatusLabel(status?: string | null) {
  if (!status) return "진행중";
  return DEAL_STATUS_LABEL[status] ?? status;
}

function getDealStatusTone(status?: string | null) {
  if (!status) return DEAL_STATUS_TONE.pending;
  return DEAL_STATUS_TONE[status] ?? DEAL_STATUS_TONE.pending;
}

export default async function MyDealsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my/deals");
  }

  const { data: dealsData } = await supabase
    .from("deals")
    .select("*")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const deals = (dealsData as DealRow[] | null) ?? [];
  const listingIds = Array.from(
    new Set(deals.map((deal) => deal.listing_id).filter(Boolean))
  ) as string[];

  const dealIds = deals
    .map((deal) => deal.id)
    .filter(Boolean) as string[];

  const [{ data: listingsData }, { data: notificationsData }] =
    await Promise.all([
      listingIds.length
        ? supabase.from("listings").select("*").in("id", listingIds)
        : Promise.resolve({ data: [] as ListingRow[] }),
      dealIds.length
        ? supabase
            .from("notifications")
            .select("*")
            .in("deal_id", dealIds)
            .eq("is_read", false)
        : Promise.resolve({ data: [] as NotificationRow[] }),
    ]);

  const listingMap = new Map<string, ListingRow>();
  ((listingsData as ListingRow[] | null) ?? []).forEach((item) => {
    if (item.id) listingMap.set(item.id, item);
  });

  const unreadCountMap = new Map<string, number>();
  ((notificationsData as NotificationRow[] | null) ?? []).forEach((item) => {
    if (!item.deal_id) return;
    unreadCountMap.set(item.deal_id, (unreadCountMap.get(item.deal_id) ?? 0) + 1);
  });

  const rows = deals.map((deal) => {
    const listing = deal.listing_id ? listingMap.get(deal.listing_id) : undefined;
    return {
      id: deal.id || "",
      status: deal.status || "pending",
      statusLabel: getDealStatusLabel(deal.status),
      title: listing?.title?.trim() || "연결된 자산 없음",
      category: listing?.category?.trim() || "other",
      priceText: formatPrice(listing?.price),
      listingStatus: listing?.status || "-",
      updatedAt: formatDate(deal.updated_at),
      createdAt: formatDate(deal.created_at),
      unreadCount: unreadCountMap.get(deal.id || "") ?? 0,
      isBuyer: deal.buyer_id === user.id,
    };
  });

  const totalCount = rows.length;
  const activeCount = rows.filter(
    (row) => row.status === "pending" || row.status === "active"
  ).length;
  const completedCount = rows.filter((row) => row.status === "completed").length;
  const unreadTotal = rows.reduce((acc, row) => acc + row.unreadCount, 0);

  return (
    <main style={pageWrap}>
      <div style={shell}>
        <div style={breadcrumbRow}>
          <Link href="/" style={breadcrumbLink}>
            홈
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>내 거래</span>
        </div>

        <section style={heroCard}>
          <div style={heroTop}>
            <div>
              <div style={heroBadge}>MY DEAL FLOW</div>
              <h1 style={heroTitle}>내 거래 관리</h1>
              <p style={heroDesc}>
                현재 진행 중인 문의와 완료된 거래를 한눈에 확인하세요. 새 메시지나
                상태 변동이 있는 거래는 우선적으로 확인하는 것이 좋습니다.
              </p>
            </div>

            <Link href="/listings" style={heroButton}>
              거래목록 보러가기
            </Link>
          </div>

          <div style={heroStats}>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>전체 거래</div>
              <div style={heroStatValue}>{totalCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>진행중</div>
              <div style={heroStatValue}>{activeCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>완료</div>
              <div style={heroStatValue}>{completedCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>읽지 않은 알림</div>
              <div style={heroStatValue}>{unreadTotal}개</div>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <div style={sectionHeader}>
            <div>
              <h2 style={sectionTitle}>거래방 목록</h2>
              <p style={sectionDesc}>
                카드에서 자산 정보와 최근 상태를 확인한 뒤 거래방으로 이동하세요.
              </p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={emptyState}>
              <div style={emptyTitle}>아직 시작된 거래가 없습니다.</div>
              <div style={emptyDesc}>
                거래목록에서 관심 있는 자산에 문의를 시작하면 여기에 표시됩니다.
              </div>
              <Link href="/listings" style={emptyButton}>
                거래목록으로 이동
              </Link>
            </div>
          ) : (
            <div style={grid}>
              {rows.map((row) => (
                <article key={row.id} style={card}>
                  <div style={cardHead}>
                    <div style={categoryChip}>{row.category}</div>
                    <div
                      style={{
                        ...statusChip,
                        ...getDealStatusTone(row.status),
                      }}
                    >
                      {row.statusLabel}
                    </div>
                  </div>

                  <div style={cardBody}>
                    <h3 style={cardTitle}>{row.title}</h3>
                    <p style={cardDesc}>
                      {row.isBuyer ? "구매 문의로 시작한 거래" : "판매 응답으로 진행 중인 거래"}
                    </p>
                  </div>

                  <div style={priceRow}>
                    <div style={mutedLabel}>대상 자산 가격</div>
                    <div style={priceValue}>{row.priceText}</div>
                  </div>

                  <div style={metaGrid}>
                    <div style={metaBox}>
                      <div style={metaLabel}>거래 생성일</div>
                      <div style={metaValue}>{row.createdAt}</div>
                    </div>
                    <div style={metaBox}>
                      <div style={metaLabel}>최근 업데이트</div>
                      <div style={metaValue}>{row.updatedAt}</div>
                    </div>
                  </div>

                  <div style={bottomRow}>
                    <div style={noticePill}>
                      읽지 않은 알림 {row.unreadCount}개
                    </div>

                    <Link href={`/deal/${row.id}`} style={primaryButton}>
                      거래방 열기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const pageWrap: React.CSSProperties = {
  background: "#f6f1e7",
  padding: "24px 0 40px",
};

const shell: React.CSSProperties = {
  maxWidth: 1480,
  margin: "0 auto",
  padding: "0 32px",
};

const breadcrumbRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 16,
  color: "#8b7457",
  fontSize: 13,
  fontWeight: 700,
};

const breadcrumbLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#8b7457",
};

const breadcrumbDivider: React.CSSProperties = {
  opacity: 0.7,
};

const breadcrumbCurrent: React.CSSProperties = {
  color: "#5e4c37",
};

const heroCard: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(243,235,223,0.94))",
  border: "1px solid #e7dbc8",
  borderRadius: 34,
  padding: "30px 30px 24px",
  boxShadow: "0 20px 45px rgba(47,36,23,0.06)",
};

const heroTop: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const heroBadge: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#8a6f4d",
  letterSpacing: "0.08em",
};

const heroTitle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 44,
  lineHeight: 1.08,
  letterSpacing: "-0.03em",
  fontWeight: 900,
  color: "#20170f",
};

const heroDesc: React.CSSProperties = {
  margin: "14px 0 0",
  maxWidth: 720,
  fontSize: 15,
  lineHeight: 1.85,
  color: "#68553c",
};

const heroButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "14px 20px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  boxShadow: "0 12px 24px rgba(47,36,23,0.14)",
};

const heroStats: React.CSSProperties = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
};

const heroStatCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #eadfcf",
  borderRadius: 24,
  padding: "18px 18px",
};

const heroStatLabel: React.CSSProperties = {
  fontSize: 13,
  color: "#8a7256",
  fontWeight: 700,
};

const heroStatValue: React.CSSProperties = {
  marginTop: 8,
  fontSize: 26,
  fontWeight: 900,
  color: "#20170f",
};

const sectionCard: React.CSSProperties = {
  marginTop: 18,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 32,
  padding: "22px 20px 20px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const sectionHeader: React.CSSProperties = {
  padding: "4px 4px 14px",
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#20170f",
};

const sectionDesc: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#7d684d",
};

const emptyState: React.CSSProperties = {
  padding: "42px 20px",
  borderRadius: 24,
  border: "1px dashed #e3d7c6",
  background: "#fffcf8",
  textAlign: "center",
};

const emptyTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#2f2417",
};

const emptyDesc: React.CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.8,
  color: "#7d684d",
};

const emptyButton: React.CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  textDecoration: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#fffdfa",
  border: "1px solid #eadfcf",
  borderRadius: 28,
  padding: "18px 18px",
  minHeight: 310,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 12px 30px rgba(47,36,23,0.04)",
};

const cardHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const categoryChip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  background: "#f3eadc",
  color: "#7a6447",
  border: "1px solid #e7dbc8",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "lowercase",
};

const statusChip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
};

const cardBody: React.CSSProperties = {
  marginTop: 18,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.35,
  color: "#2f2417",
  fontWeight: 900,
  letterSpacing: "-0.02em",
};

const cardDesc: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#6f5b42",
  minHeight: 50,
};

const priceRow: React.CSSProperties = {
  marginTop: 20,
};

const mutedLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#8f7758",
  fontWeight: 700,
};

const priceValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 900,
  color: "#20170f",
};

const metaGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const metaBox: React.CSSProperties = {
  borderRadius: 18,
  background: "#fcf8f2",
  border: "1px solid #efe3d3",
  padding: "12px 12px",
};

const metaLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#8f7758",
  fontWeight: 700,
};

const metaValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 14,
  color: "#2f2417",
  fontWeight: 800,
};

const bottomRow: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const noticePill: React.CSSProperties = {
  borderRadius: 999,
  background: "#f3eadc",
  color: "#7a6447",
  border: "1px solid #e7dbc8",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
};

const primaryButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  textAlign: "center",
};