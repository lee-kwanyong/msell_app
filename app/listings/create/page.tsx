import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

const STATUS_OPTIONS = [
  { value: "active", label: "거래가능" },
  { value: "hidden", label: "숨김" },
  { value: "draft", label: "임시저장" },
  { value: "sold", label: "거래종료" },
];

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/listings/create");
  }

  const errorText =
    params.error === "missing_required_fields"
      ? "제목, 카테고리, 희망 가격은 필수입니다."
      : params.error === "create_failed"
      ? "등록 처리 중 문제가 발생했습니다. 다시 시도해 주세요."
      : params.error === "unauthorized"
      ? "로그인 후 다시 시도해 주세요."
      : "";

  return (
    <main style={pageWrap}>
      <div style={shell}>
        <div style={breadcrumbRow}>
          <Link href="/listings" style={breadcrumbLink}>
            거래목록
          </Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>자산 등록하기</span>
        </div>

        <section style={heroGrid}>
          <div style={heroCard}>
            <div style={heroBadge}>CREATE LISTING</div>
            <h1 style={heroTitle}>새 자산 등록</h1>
            <p style={heroDesc}>
              거래 대상의 핵심 정보와 이전 방식을 명확하게 적어두면 문의 품질이
              더 좋아집니다. 허위매물이나 권리관계가 불분명한 자산은 등록할 수
              없습니다.
            </p>

            <div style={guideGrid}>
              <div style={guideCard}>
                <div style={guideTitle}>등록 전에 확인</div>
                <ul style={guideList}>
                  <li>실제 거래 가능한 자산만 등록</li>
                  <li>권리 보유 여부와 이전 범위 명확히 기재</li>
                  <li>외부결제 유도 문구 금지</li>
                </ul>
              </div>

              <div style={guideCard}>
                <div style={guideTitle}>권장 작성 방식</div>
                <ul style={guideList}>
                  <li>가격 기준과 협의 가능 여부 명시</li>
                  <li>운영 상태, 이전 절차, 포함 범위 설명</li>
                  <li>양도 제한사항이 있다면 반드시 표기</li>
                </ul>
              </div>
            </div>
          </div>

          <aside style={sideCard}>
            <div style={sideLabel}>POLICY</div>
            <div style={sideTitle}>등록 정책 빠른 확인</div>
            <p style={sideDesc}>
              타인 명의 자산, 권리침해 자산, 약관상 양도 금지 자산은 등록할 수
              없습니다.
            </p>

            <div style={sideLinks}>
              <Link href="/seller-policy" style={pillLink}>
                판매자 등록정책
              </Link>
              <Link href="/dispute-policy" style={pillLink}>
                분쟁처리 및 신고정책
              </Link>
            </div>
          </aside>
        </section>

        <section style={formCard}>
          <div style={formHeader}>
            <div>
              <h2 style={formTitle}>등록 정보 입력</h2>
              <p style={formDesc}>
                아래 항목을 채운 뒤 등록하면 거래목록에 반영됩니다.
              </p>
            </div>
          </div>

          {errorText ? <div style={errorBox}>{errorText}</div> : null}

          <form action="/api/listings/create" method="post" style={formStyle}>
            <div style={grid}>
              <div style={fieldFull}>
                <label htmlFor="title" style={label}>
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
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
                  defaultValue="other"
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
                  defaultValue="active"
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
                  placeholder="자산의 현재 상태, 운영 이력, 포함 범위, 이전 절차, 협의 가능한 조건 등을 자세히 적어주세요."
                  style={textarea}
                  rows={10}
                />
              </div>
            </div>

            <div style={noticeBox}>
              <div style={noticeTitle}>등록 시 유의사항</div>
              <ul style={noticeList}>
                <li>허위매물 등록 시 게시물 삭제 및 계정 제한이 이루어질 수 있습니다.</li>
                <li>최종 거래 조건 확인과 실제 계약 체결 책임은 거래 당사자에게 있습니다.</li>
                <li>회사 승인 없는 외부결제 유도는 제재 대상이 될 수 있습니다.</li>
              </ul>
            </div>

            <div style={buttonRow}>
              <Link href="/listings" style={cancelButton}>
                취소
              </Link>
              <button type="submit" style={submitButton}>
                자산 등록하기
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

const guideGrid: React.CSSProperties = {
  marginTop: 22,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
};

const guideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #eadfcf",
  borderRadius: 24,
  padding: "18px 18px",
};

const guideTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  color: "#2f2417",
};

const guideList: React.CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 20,
  fontSize: 14,
  lineHeight: 1.85,
  color: "#6b5741",
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

const sideLinks: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const pillLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#5c4a33",
  fontSize: 13,
  fontWeight: 700,
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid #e4d8c7",
  background: "#fff",
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
};