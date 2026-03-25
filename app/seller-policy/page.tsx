export default function SellerPolicyPage() {
  return (
    <main style={pageWrap}>
      <div style={container}>
        <div style={heroBox}>
          <div style={eyebrow}>Msell Policy</div>
          <h1 style={title}>판매자 등록정책</h1>
          <p style={desc}>
            Msell은 신뢰 가능한 거래환경 조성을 위해 판매회원의 등록기준과
            준수사항을 다음과 같이 정합니다.
          </p>
          <div style={effectiveDate}>시행일: 2026년 3월 25일</div>
        </div>

        <div style={card}>
          <Section title="1. 기본원칙">
            판매회원은 실제 거래 가능한 대상만 등록해야 하며, 거래에 필요한 핵심
            정보를 정확하게 기재해야 합니다.
          </Section>

          <Section title="2. 등록 가능 조건">
            <Bullet
              items={[
                "본인 명의의 계정을 사용할 것",
                "실제 연락 가능한 정보를 제공할 것",
                "등록 대상에 대한 권리 또는 처분 권한이 있을 것",
                "회사의 정책 및 관련 법령을 준수할 것",
              ]}
            />
          </Section>

          <Section title="3. 등록 시 필수 기재사항">
            <Bullet
              items={[
                "거래대상의 실제 내용",
                "가격 또는 희망 조건",
                "이전 방식 또는 인수 방식",
                "제한사항 또는 유의사항",
                "거래 후 필요한 추가 조건",
              ]}
            />
          </Section>

          <Section title="4. 등록 금지 항목">
            <Bullet
              items={[
                "허위매물 또는 존재하지 않는 거래대상",
                "타인 명의 자산 또는 무권한 자산",
                "저작권, 상표권 등 권리침해 자산",
                "원 서비스 약관상 양도 금지된 계정 또는 권리",
                "사기 또는 기망 목적의 게시물",
                "반복 중복 등록 또는 검색노출 조작 목적의 등록",
                "법령 또는 공서양속에 위반되는 항목",
              ]}
            />
          </Section>

          <Section title="5. 검수 및 제재">
            회사는 등록 게시물에 대해 검수, 수정 요청, 비공개 처리, 삭제, 노출
            제한 또는 계정 제재를 할 수 있습니다.
          </Section>

          <Section title="6. 신뢰지표 운영">
            회사는 인증 여부, 신고 이력, 활동 이력 등을 기준으로 내부 신뢰지표를
            운영할 수 있습니다. 다만 이 지표는 회사의 거래 보증 또는 품질 보증을
            의미하지 않습니다.
          </Section>

          <div style={noticeBox}>
            <strong style={{ color: "#2f2417" }}>등록 전 꼭 확인</strong>
            <ul style={noticeList}>
              <li>타인 명의 자산, 권리침해 자산, 약관상 양도 금지 자산은 등록할 수 없습니다.</li>
              <li>허위매물 등록 시 게시물 삭제 및 계정 제한이 이루어질 수 있습니다.</li>
              <li>회사 승인 없는 외부결제 유도는 제재 대상이 될 수 있습니다.</li>
            </ul>
          </div>

          <div style={bottomNote}>
            부칙: 본 정책은 2026년 3월 25일부터 시행합니다.
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionBody}>{children}</div>
    </section>
  );
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul style={list}>
      {items.map((item, idx) => (
        <li key={`${idx}-${item.slice(0, 10)}`} style={listItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

const pageWrap: React.CSSProperties = {
  background: "#f6f1e7",
  minHeight: "100vh",
  padding: "32px 16px 80px",
};

const container: React.CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
};

const heroBox: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #eadfcf",
  borderRadius: 24,
  padding: "28px 24px",
  boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
  marginBottom: 18,
};

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#8a6f4d",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 10,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.2,
  color: "#2f2417",
  fontWeight: 800,
};

const desc: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 15,
  lineHeight: 1.75,
  color: "#5c4a33",
};

const effectiveDate: React.CSSProperties = {
  marginTop: 14,
  fontSize: 13,
  color: "#8a6f4d",
  fontWeight: 700,
};

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #eadfcf",
  borderRadius: 24,
  padding: "8px 24px 20px",
  boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
};

const section: React.CSSProperties = {
  padding: "22px 0",
  borderBottom: "1px solid #f1e7d8",
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.4,
  fontWeight: 800,
  color: "#2f2417",
};

const sectionBody: React.CSSProperties = {
  marginTop: 12,
  fontSize: 15,
  lineHeight: 1.85,
  color: "#4f4030",
};

const list: React.CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 20,
};

const listItem: React.CSSProperties = {
  marginBottom: 6,
};

const noticeBox: React.CSSProperties = {
  marginTop: 22,
  background: "#fcfaf6",
  border: "1px solid #efe2cf",
  borderRadius: 18,
  padding: "16px 18px",
  color: "#5b4833",
};

const noticeList: React.CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 20,
  lineHeight: 1.8,
};

const bottomNote: React.CSSProperties = {
  paddingTop: 20,
  fontSize: 14,
  color: "#7b6548",
  fontWeight: 700,
};