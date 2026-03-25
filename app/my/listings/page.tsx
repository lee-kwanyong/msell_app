import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id?: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  status?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  transfer_method?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  pending_review: "검토중",
  active: "거래가능",
  reserved: "예약중",
  sold: "거래종료",
  hidden: "숨김",
  rejected: "반려",
  archived: "보관됨",
};

const STATUS_TONE: Record<string, React.CSSProperties> = {
  draft: {
    background: "#f4eee4",
    color: "#7d674d",
    border: "1px solid #e6dac8",
  },
  pending_review: {
    background: "#fff3dd",
    color: "#946200",
    border: "1px solid #f1ddab",
  },
  active: {
    background: "#edf8ef",
    color: "#1d8a43",
    border: "1px solid #cae9d2",
  },
  reserved: {
    background: "#eef4ff",
    color: "#2d64c8",
    border: "1px solid #d6e3ff",
  },
  sold: {
    background: "#f3f1f7",
    color: "#6b5c88",
    border: "1px solid #ddd6eb",
  },
  hidden: {
    background: "#f1f1f1",
    color: "#666",
    border: "1px solid #dfdfdf",
  },
  rejected: {
    background: "#fff0f0",
    color: "#b23a3a",
    border: "1px solid #f1cfcf",
  },
  archived: {
    background: "#f3f0eb",
    color: "#7a6b5e",
    border: "1px solid #e3d9cd",
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

function getStatusLabel(status?: string | null) {
  if (!status) return "상태미정";
  return STATUS_LABEL[status] ?? status;
}

function getStatusTone(status?: string | null) {
  if (!status) {
    return {
      background: "#f4eee4",
      color: "#7d674d",
      border: "1px solid #e6dac8",
    };
  }
  return STATUS_TONE[status] ?? STATUS_TONE.draft;
}

export default async function MyListingsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my/listings");
  }

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = ((data as ListingRow[] | null) ?? []).map((row) => {
    const description = row.description?.trim() || "";
    return {
      id: row.id || "",
      title: row.title?.trim() || "제목 없는 자산",
      category: row.category?.trim() || "other",
      status: row.status || "draft",
      statusLabel: getStatusLabel(row.status),
      priceText: formatPrice(row.price),
      descriptionPreview: description
        ? description.length > 100
          ? `${description.slice(0, 100)}...`
          : description
        : "등록된 설명이 없습니다.",
      createdAt: formatDate(row.created_at),
      updatedAt: formatDate(row.updated_at),
      transferMethod: row.transfer_method?.trim() || "협의",
    };
  });

  const totalCount = rows.length;
  const activeCount = rows.filter((row) => row.status === "active").length;
  const hiddenCount = rows.filter((row) => row.status === "hidden").length;
  const soldCount = rows.filter((row) => row.status === "sold").length;

  return (
    <main style={pageWrap}>
      <div style={shell}>
        <div style={breadcrumbRow}>
          <Link href="/" style={breadcrumbLink}>
            홈
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>내 자산</span>
        </div>

        <section style={heroCard}>
          <div style={heroTop}>
            <div>
              <div style={heroBadge}>MY PORTFOLIO</div>
              <h1 style={heroTitle}>내 자산 관리</h1>
              <p style={heroDesc}>
                내가 등록한 자산의 상태와 가격을 한곳에서 관리할 수 있습니다.
                수정이 필요한 게시물은 바로 편집하고, 공개 상태도 함께 점검하세요.
              </p>
            </div>

            <Link href="/listings/create" style={heroButton}>
              새 자산 등록
            </Link>
          </div>

          <div style={heroStats}>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>전체 자산</div>
              <div style={heroStatValue}>{totalCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>거래가능</div>
              <div style={heroStatValue}>{activeCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>숨김</div>
              <div style={heroStatValue}>{hiddenCount}개</div>
            </div>
            <div style={heroStatCard}>
              <div style={heroStatLabel}>거래종료</div>
              <div style={heroStatValue}>{soldCount}개</div>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <div style={sectionHeader}>
            <div>
              <h2 style={sectionTitle}>내 등록 자산</h2>
              <p style={sectionDesc}>
                각 카드에서 상태를 확인하고 상세 또는 수정 화면으로 이동하세요.
              </p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={emptyState}>
              <div style={emptyTitle}>아직 등록한 자산이 없습니다.</div>
              <div style={emptyDesc}>
                첫 번째 자산을 등록하면 여기에서 바로 관리할 수 있습니다.
              </div>
              <Link href="/listings/create" style={emptyButton}>
                첫 자산 등록하기
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
                        ...getStatusTone(row.status),
                      }}
                    >
                      {row.statusLabel}
                    </div>
                  </div>

                  <div style={cardBody}>
                    <h3 style={cardTitle}>{row.title}</h3>
                    <p style={cardDesc}>{row.descriptionPreview}</p>
                  </div>

                  <div style={priceRow}>
                    <div style={mutedLabel}>희망 가격</div>
                    <div style={priceValue}>{row.priceText}</div>
                  </div>

                  <div style={metaGrid}>
                    <div style={metaBox}>
                      <div style={metaLabel}>이전 방식</div>
                      <div style={metaValue}>{row.transferMethod}</div>
                    </div>
                    <div style={metaBox}>
                      <div style={metaLabel}>수정일</div>
                      <div style={metaValue}>{row.updatedAt}</div>
                    </div>
                  </div>

                  <div style={buttonRow}>
                    <Link href={`/listings/${row.id}`} style={secondaryButton}>
                      상세보기
                    </Link>
                    <Link href={`/listings/${row.id}/edit`} style={primaryButton}>
                      수정하기
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
  minHeight: 320,
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
  minHeight: 70,
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

const buttonRow: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const secondaryButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#eadfcf",
  color: "#2f2417",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  textAlign: "center",
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