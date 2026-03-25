type SearchParams = Promise<{
  success?: string;
  error?: string;
}>;

export default async function AdvertiseInquiryPage(props: {
  searchParams?: SearchParams;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const success = searchParams.success;
  const error = searchParams.error;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 28,
            padding: "28px 22px",
            boxShadow: "0 18px 50px rgba(47,36,23,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#7b664e",
              letterSpacing: "0.08em",
            }}
          >
            MSSELL AD INQUIRY
          </div>

          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: 30,
              lineHeight: 1.15,
              letterSpacing: "-0.04em",
              color: "#2f2417",
            }}
          >
            광고 / 상위고정노출 문의 작성
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.8,
              color: "#6f5c47",
            }}
          >
            광고 유형, 연락처, 예산, 원하는 노출 영역을 남겨주세요. 접수된
            문의는 관리자 페이지에서 바로 확인할 수 있습니다.
          </p>

          {success ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 16,
                background: "#f4efe6",
                padding: 14,
                color: "#2f2417",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              문의가 정상적으로 접수되었습니다.
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 16,
                background: "#fff1ef",
                padding: 14,
                color: "#9a3426",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {decodeURIComponent(error)}
            </div>
          ) : null}

          <form
            action="/api/ad-inquiries/create"
            method="post"
            style={{
              marginTop: 22,
              display: "grid",
              gap: 16,
            }}
          >
            <div style={grid2}>
              <Field label="문의 유형">
                <select name="inquiry_type" required style={inputStyle}>
                  <option value="advertising">일반 광고 문의</option>
                  <option value="top_fixed">상위 고정 노출</option>
                  <option value="banner">배너 광고</option>
                  <option value="partnership">제휴 / 협업</option>
                </select>
              </Field>

              <Field label="문의 제목">
                <input
                  name="title"
                  required
                  placeholder="예: 메인 상단 고정 광고 문의"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={grid2}>
              <Field label="회사명 / 브랜드명">
                <input
                  name="company_name"
                  placeholder="선택 입력"
                  style={inputStyle}
                />
              </Field>

              <Field label="담당자명">
                <input
                  name="contact_name"
                  required
                  placeholder="담당자 이름"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={grid2}>
              <Field label="이메일">
                <input
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  style={inputStyle}
                />
              </Field>

              <Field label="휴대폰 번호">
                <input
                  name="phone_number"
                  placeholder="01012345678"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={grid2}>
              <Field label="카카오톡 ID">
                <input
                  name="kakao_id"
                  placeholder="선택 입력"
                  style={inputStyle}
                />
              </Field>

              <Field label="텔레그램 ID">
                <input
                  name="telegram_id"
                  placeholder="선택 입력"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={grid2}>
              <Field label="예산">
                <input
                  name="budget"
                  placeholder="예: 월 100만원 / 협의 가능"
                  style={inputStyle}
                />
              </Field>

              <Field label="희망 노출 영역">
                <input
                  name="target_service"
                  placeholder="예: 홈 상단, 카테고리 상위 고정"
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="문의 내용">
              <textarea
                name="body"
                required
                placeholder="원하는 광고 방식, 집행 기간, 대상 고객, 노출 희망 위치 등을 자세히 적어주세요."
                style={{
                  ...inputStyle,
                  minHeight: 180,
                  paddingTop: 14,
                  resize: "vertical",
                }}
              />
            </Field>

            <button type="submit" style={submitButtonStyle}>
              문의 접수하기
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#4f3f2c",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 50,
  borderRadius: 14,
  border: "1px solid #dccbb3",
  background: "#fffdf9",
  padding: "0 14px",
  fontSize: 14,
  color: "#2f2417",
  outline: "none",
  boxSizing: "border-box",
};

const submitButtonStyle: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  height: 54,
  border: "none",
  borderRadius: 16,
  background: "#2f2417",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
};