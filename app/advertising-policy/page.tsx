export default function AdvertisingPolicyPage() {
  return (
    <main style={pageWrap}>
      <div style={container}>
        <div style={heroBox}>
          <div style={eyebrow}>Msell Policy</div>
          <h1 style={title}>광고 운영정책</h1>
          <p style={desc}>
            Msell은 광고와 일반 콘텐츠를 명확히 구분하고, 이용자가 오인하지
            않도록 광고를 운영합니다.
          </p>
          <div style={effectiveDate}>시행일: 2026년 3월 25일</div>
        </div>

        <div style={card}>
          <Section title="1. 광고의 범위">
            <Bullet
              items={[
                "상위노출 상품",
                "배너광고",
                "추천 영역 노출",
                "유료 강조 노출",
                "기타 경제적 대가를 받고 제공하는 홍보성 노출",
              ]}
            />
          </Section>

          <Section title="2. 광고 표기 원칙">
            <Bullet
              items={[
                "광고 또는 유료노출 콘텐츠에는 이용자가 쉽게 인지할 수 있는 방식으로 “광고”, “유료노출”, “스폰서드”, “프로모션” 등의 문구를 표시할 수 있습니다.",
                "광고는 일반 검색결과 또는 일반 목록과 혼동되지 않도록 구분하여 노출합니다.",
                "광고상품 구매 여부는 거래 안전성, 적법성, 수익성 또는 신뢰도에 대한 회사의 보증을 의미하지 않습니다.",
              ]}
            />
          </Section>

          <Section title="3. 광고 제한 항목">
            <Bullet
              items={[
                "허위 또는 과장된 내용",
                "원금보장, 수익보장, 100% 성공 등의 확정적 표현",
                "공식 인증, 정부 인증, 검증 완료 등 오인 유발 표현",
                "타인의 권리 또는 법령을 침해하는 내용",
                "불법, 사행성, 사기성이 의심되는 내용",
                "플랫폼 운영 취지에 맞지 않는 내용",
                "이용자 피해 우려가 있는 내용",
              ]}
            />
          </Section>

          <Section title="4. 광고주의 책임">
            <Bullet
              items={[
                "광고 내용의 적법성, 진실성, 권리관계에 대한 책임은 광고주에게 있습니다.",
                "광고주는 회사가 요청하는 경우 관련 증빙자료를 제출해야 할 수 있습니다.",
                "광고 내용으로 인해 민원, 분쟁, 손해가 발생한 경우 광고주가 우선 책임을 부담합니다.",
              ]}
            />
          </Section>

          <Section title="5. 광고 중단 및 제한">
            회사는 다음 사유가 있는 경우 광고를 사전 통지 없이 중단, 보류, 수정
            요청 또는 삭제할 수 있습니다.
            <Bullet
              items={[
                "법령 또는 정책 위반",
                "허위자료 제출",
                "신고 또는 분쟁 발생",
                "이용자 보호 필요성",
                "회사 서비스의 신뢰성 또는 안정성 저해",
              ]}
            />
          </Section>

          <Section title="6. 환불">
            광고상품의 환불 여부, 환불 금액, 환불 제한 사유는 별도의 환불정책
            또는 개별 상품 안내를 따릅니다.
          </Section>

          <div style={noticeBox}>
            <strong style={{ color: "#2f2417" }}>안내</strong>
            <p style={{ margin: "8px 0 0", lineHeight: 1.8 }}>
              상위노출 및 광고상품은 유료 프로모션 서비스이며 거래 성사,
              안전성, 신뢰도를 보장하지 않습니다.
            </p>
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

const bottomNote: React.CSSProperties = {
  paddingTop: 20,
  fontSize: 14,
  color: "#7b6548",
  fontWeight: 700,
};