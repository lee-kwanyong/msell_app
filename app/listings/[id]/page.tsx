import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  seller_name?: string | null;
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

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const [
    { data: listingData },
    { data: authData },
  ] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const listing = (listingData as ListingRow | null) ?? null;
  if (!listing?.id) notFound();

  const user = authData.user ?? null;
  const isOwner = !!user?.id && !!listing.user_id && user.id === listing.user_id;

  const title = listing.title?.trim() || "제목 없는 자산";
  const category = listing.category?.trim() || "other";
  const description = listing.description?.trim() || "등록된 설명이 없습니다.";
  const transferMethod = listing.transfer_method?.trim() || "협의";
  const priceText = formatPrice(listing.price);
  const status = listing.status || "draft";
  const statusLabel = getStatusLabel(status);
  const createdAt = formatDate(listing.created_at);
  const updatedAt = formatDate(listing.updated_at);

  async function createDeal(formData: FormData) {
    "use server";

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/auth/login?next=/listings/${id}`);
    }

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/deals/create`, {
      method: "POST",
      body: formData,
      headers: {},
      cache: "no-store",
    });
  }

  return (
    <main style={pageWrap}>
      <div style={shell}>
        <div style={breadcrumbRow}>
          <Link href="/listings" style={breadcrumbLink}>
            거래목록
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>{title}</span>
        </div>

        <section style={heroGrid}>
          <div style={mainCard}>
            <div style={topLine}>
              <div style={categoryChip}>{category}</div>
              <div
                style={{
                  ...statusChip,
                  ...getStatusTone(status),
                }}
              >
                {statusLabel}
              </div>
            </div>

            <h1 style={titleStyle}>{title}</h1>

            <div style={priceWrap}>
              <div style={priceLabel}>희망 가격</div>
              <div style={priceValue}>{priceText}</div>
            </div>

            <div style={descBox}>
              <div style={sectionMiniTitle}>설명</div>
              <p style={descText}>{description}</p>
            </div>

            <div style={metaGrid}>
              <div style={metaCard}>
                <div style={metaLabel}>이전 방식</div>
                <div style={metaValue}>{transferMethod}</div>
              </div>
              <div style={metaCard}>
                <div style={metaLabel}>등록일</div>
                <div style={metaValue}>{createdAt}</div>
              </div>
              <div style={metaCard}>
                <div style={metaLabel}>수정일</div>
                <div style={metaValue}>{updatedAt}</div>
              </div>
              <div style={metaCard}>
                <div style={metaLabel}>상태</div>
                <div style={metaValue}>{statusLabel}</div>
              </div>
            </div>
          </div>

          <aside style={sideColumn}>
            <div style={actionCard}>
              <div style={actionLabel}>거래 안내</div>
              <div style={actionTitle}>문의 전 꼭 확인하세요</div>
              <p style={actionDesc}>
                최종 거래 조건 확인과 실제 계약 체결 책임은 거래 당사자에게
                있습니다. 외부결제 유도, 안전거래 사칭, 허위정보가 의심되면 즉시
                신고해 주세요.
              </p>

              {isOwner ? (
                <div style={ownerButtons}>
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    style={primaryButton}
                  >
                    게시물 수정하기
                  </Link>
                  <Link href="/my/listings" style={secondaryButton}>
                    내 자산으로 이동
                  </Link>
                </div>
              ) : status === "active" ? (
                <form action="/api/deals/create" method="post" style={formStyle}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={`/listings/${listing.id}`}
                  />
                  <button type="submit" style={primaryButtonAsButton}>
                    거래 문의 시작
                  </button>
                </form>
              ) : (
                <div style={closedNotice}>
                  현재 이 게시물은 거래 문의를 받을 수 없는 상태입니다.
                </div>
              )}

              <div style={policyLinks}>
                <Link href="/seller-policy" style={policyLink}>
                  판매자 등록정책
                </Link>
                <Link href="/dispute-policy" style={policyLink}>
                  분쟁처리 및 신고정책
                </Link>
              </div>
            </div>

            <div style={safeCard}>
              <div style={safeTitle}>거래 안전 체크</div>
              <ul style={safeList}>
                <li>플랫폼 외부 결제 유도 여부 확인</li>
                <li>거래 대상 권리 보유 여부 확인</li>
                <li>설명과 실제 이전 범위가 일치하는지 확인</li>
                <li>의심 정황이 있으면 바로 신고</li>
              </ul>
            </div>
          </aside>
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

const heroGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.45fr 0.75fr",
  gap: 18,
  alignItems: "start",
};

const mainCard: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(243,235,223,0.94))",
  border: "1px solid #e7dbc8",
  borderRadius: 34,
  padding: "28px 28px 24px",
  boxShadow: "0 20px 45px rgba(47,36,23,0.06)",
};

const topLine: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
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

const titleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: 46,
  lineHeight: 1.12,
  letterSpacing: "-0.03em",
  fontWeight: 900,
  color: "#20170f",
};

const priceWrap: React.CSSProperties = {
  marginTop: 22,
  padding: "22px 22px",
  borderRadius: 26,
  background: "#fffdfa",
  border: "1px solid #eadfcf",
};

const priceLabel: React.CSSProperties = {
  fontSize: 13,
  color: "#8f7758",
  fontWeight: 700,
};

const priceValue: React.CSSProperties = {
  marginTop: 8,
  fontSize: 38,
  lineHeight: 1.08,
  fontWeight: 900,
  color: "#20170f",
};

const descBox: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 26,
  background: "rgba(255,255,255,0.76)",
  border: "1px solid #eadfcf",
  padding: "20px 20px",
};

const sectionMiniTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  color: "#2f2417",
};

const descText: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 15,
  lineHeight: 1.9,
  color: "#5f4d39",
  whiteSpace: "pre-wrap",
};

const metaGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const metaCard: React.CSSProperties = {
  borderRadius: 22,
  background: "#fcf8f2",
  border: "1px solid #efe3d3",
  padding: "16px 16px",
};

const metaLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#8f7758",
  fontWeight: 700,
};

const metaValue: React.CSSProperties = {
  marginTop: 8,
  fontSize: 15,
  color: "#2f2417",
  fontWeight: 800,
};

const sideColumn: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const actionCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 30,
  padding: "24px 22px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const actionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#8a6f4d",
  letterSpacing: "0.08em",
};

const actionTitle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#20170f",
};

const actionDesc: React.CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.85,
  color: "#6a5740",
};

const formStyle: React.CSSProperties = {
  marginTop: 18,
};

const ownerButtons: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 18,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  textDecoration: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "14px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  boxShadow: "0 12px 24px rgba(47,36,23,0.14)",
};

const primaryButtonAsButton: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "14px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(47,36,23,0.14)",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  textDecoration: "none",
  background: "#eadfcf",
  color: "#2f2417",
  padding: "14px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
};

const closedNotice: React.CSSProperties = {
  marginTop: 18,
  background: "#fcf8f2",
  border: "1px solid #eadfcf",
  borderRadius: 18,
  padding: "14px 14px",
  fontSize: 14,
  lineHeight: 1.7,
  color: "#7a6447",
};

const policyLinks: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const policyLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#5c4a33",
  fontSize: 13,
  fontWeight: 700,
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid #e4d8c7",
  background: "#fff",
};

const safeCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 30,
  padding: "22px 22px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const safeTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#2f2417",
};

const safeList: React.CSSProperties = {
  margin: "12px 0 0",
  paddingLeft: 20,
  color: "#6a5740",
  lineHeight: 1.9,
  fontSize: 14,
};