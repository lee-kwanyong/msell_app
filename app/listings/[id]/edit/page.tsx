import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

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

const STATUS_OPTIONS = [
  { value: "active", label: "거래가능" },
  { value: "hidden", label: "숨김" },
  { value: "draft", label: "임시저장" },
  { value: "sold", label: "거래종료" },
];

function getErrorText(error?: string) {
  if (error === "missing_required_fields") {
    return "제목, 카테고리, 희망 가격은 필수입니다.";
  }
  if (error === "update_failed") {
    return "수정 처리 중 문제가 발생했습니다. 다시 시도해 주세요.";
  }
  if (error === "unauthorized") {
    return "수정 권한이 없습니다.";
  }
  if (error === "not_found") {
    return "존재하지 않는 게시물입니다.";
  }
  return "";
}

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const qs = (await searchParams) ?? {};

  const supabase = await supabaseServer();

  const [
    {
      data: { user },
    },
    { data: listingData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("listings").select("*").eq("id", id).maybeSingle(),
  ]);

  if (!user) {
    redirect(`/auth/login?next=/listings/${id}/edit`);
  }

  const listing = (listingData as ListingRow | null) ?? null;
  if (!listing?.id) notFound();
  if (listing.user_id !== user.id) {
    redirect("/my/listings");
  }

  const errorText = getErrorText(qs.error);

  return (
    <main style={pageWrap}>
      <div style={shell}>
        <div style={breadcrumbRow}>
          <Link href="/my/listings" style={breadcrumbLink}>
            내 자산
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <Link href={`/listings/${id}`} style={breadcrumbLink}>
            상세보기
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>수정하기</span>
        </div>

        <section style={heroGrid}>
          <div style={heroCard}>
            <div style={heroBadge}>EDIT LISTING</div>
            <h1 style={heroTitle}>자산 정보 수정</h1>
            <p style={heroDesc}>
              현재 등록된 게시물의 제목, 가격, 설명, 상태를 수정할 수 있습니다.
              내용이 실제 거래 조건과 다르지 않도록 최신 상태로 유지하세요.
            </p>
          </div>

          <aside style={sideCard}>
            <div style={sideLabel}>CURRENT STATUS</div>
            <div style={sideTitle}>{listing.title || "제목 없는 자산"}</div>
            <p style={sideDesc}>
              잘못된 정보나 오래된 설명은 문의 품질을 떨어뜨릴 수 있습니다.
              수정 후에는 상세 페이지에서 최종 반영 상태를 확인하세요.
            </p>
          </aside>
        </section>

        <section style={formCard}>
          <div style={formHeader}>
            <div>
              <h2 style={formTitle}>수정 정보 입력</h2>
              <p style={formDesc}>
                필요한 항목만 고치는 것이 아니라 전체 내용을 다시 점검하는 것을
                권장합니다.
              </p>
            </div>
          </div>

          {errorText ? <div style={errorBox}>{errorText}</div> : null}

          <form action="/api/listings/update" method="post" style={formStyle}>
            <input type="hidden" name="id" value={listing.id} />

            <div style={grid}>
              <div style={fieldFull}>
                <label htmlFor="title" style={label}>
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  defaultValue={listing.title ?? ""}
                  placeholder="예: 유튜브 채널 운영권 양도"
                  style={input}
                  required
                />
              </div>

              <div style={fieldHalf}>
                <label htmlFor="category" style={label}>
                  카테고리
                </label>
                <CategoryDropdown
                  name="category"
                  defaultValue={listing.category ?? "other"}
                  required
                />
              </div>

              <div style={fieldHalf}>
                <label htmlFor="price" style={label}>
                  희망 가격
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  inputMode="numeric"
                  defaultValue={
                    listing.price === null || listing.price === undefined
                      ? ""
                      : String(listing.price)
                  }
                  placeholder="예: 10000000"
                  style={input}
                  required
                />
              </div>

              <div style={fieldHalf}>
                <label htmlFor="transfer_method" style={label}>
                  이전 방식
                </label>
                <input
                  id="transfer_method"
                  name="transfer_method"
                  type="text"
                  defaultValue={listing.transfer_method ?? ""}
                  placeholder="예: 계정 전체 양도 / 관리자 권한 이전 / 협의"
                  style={input}
                />
              </div>

              <div style={fieldHalf}>
                <label htmlFor="status" style={label}>
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={listing.status ?? "active"}
                  style={select}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldFull}>
                <label htmlFor="description" style={label}>
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={listing.description ?? ""}
                  placeholder="자산의 현재 상태, 운영 이력, 포함 범위, 이전 절차, 협의 가능한 조건 등을 자세히 적어주세요."
                  style={textarea}
                  rows={10}
                />
              </div>
            </div>

            <div style={noticeBox}>
              <div style={noticeTitle}>수정 시 유의사항</div>
              <ul style={noticeList}>
                <li>권리관계가 불분명한 자산은 계속 노출될 수 없습니다.</li>
                <li>상태를 거래종료로 바꾸면 신규 문의 유입이 줄어들 수 있습니다.</li>
                <li>허위정보 반영 시 게시물 제한 또는 계정 제재가 발생할 수 있습니다.</li>
              </ul>
            </div>

            <div style={buttonRow}>
              <Link href={`/listings/${id}`} style={cancelButton}>
                취소
              </Link>
              <button type="submit" className="msell-dark-pill" style={submitButton}>
                수정 저장하기
              </button>
            </div>
          </form>
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
  gridTemplateColumns: "1.35fr 0.75fr",
  gap: 18,
  alignItems: "start",
};

const heroCard: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(243,235,223,0.94))",
  border: "1px solid #e7dbc8",
  borderRadius: 34,
  padding: "30px 30px 24px",
  boxShadow: "0 20px 45px rgba(47,36,23,0.06)",
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
  maxWidth: 760,
  fontSize: 15,
  lineHeight: 1.85,
  color: "#68553c",
};

const sideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 30,
  padding: "24px 22px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const sideLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#8a6f4d",
  letterSpacing: "0.08em",
};

const sideTitle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#20170f",
};

const sideDesc: React.CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.85,
  color: "#6a5740",
};

const formCard: React.CSSProperties = {
  marginTop: 18,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 32,
  padding: "22px 20px 20px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const formHeader: React.CSSProperties = {
  padding: "4px 4px 14px",
};

const formTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#20170f",
};

const formDesc: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#7d684d",
};

const errorBox: React.CSSProperties = {
  marginBottom: 16,
  borderRadius: 18,
  background: "#fff0f0",
  border: "1px solid #f1cfcf",
  color: "#b23a3a",
  padding: "14px 16px",
  fontSize: 14,
  fontWeight: 700,
};

const formStyle: React.CSSProperties = {
  display: "block",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldFull: React.CSSProperties = {
  gridColumn: "1 / -1",
};

const fieldHalf: React.CSSProperties = {
  minWidth: 0,
};

const label: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 800,
  color: "#2f2417",
};

const input: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #e4d8c7",
  background: "#fffdfa",
  padding: "14px 16px",
  fontSize: 15,
  color: "#2f2417",
  outline: "none",
};

const select: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #e4d8c7",
  background: "#fffdfa",
  padding: "14px 16px",
  fontSize: 15,
  color: "#2f2417",
  outline: "none",
  appearance: "none",
};

const textarea: React.CSSProperties = {
  width: "100%",
  borderRadius: 22,
  border: "1px solid #e4d8c7",
  background: "#fffdfa",
  padding: "16px 16px",
  fontSize: 15,
  color: "#2f2417",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.8,
};

const noticeBox: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 24,
  background: "#fcf8f2",
  border: "1px solid #efe3d3",
  padding: "18px 18px",
};

const noticeTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
  color: "#2f2417",
};

const noticeList: React.CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 20,
  fontSize: 14,
  lineHeight: 1.85,
  color: "#6b5741",
};

const buttonRow: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  flexWrap: "wrap",
};

const cancelButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#eadfcf",
  color: "#2f2417",
  padding: "14px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
};

const submitButton: React.CSSProperties = {
  border: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "14px 18px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(47,36,23,0.14)",
  transition: "all 0.18s ease",
};