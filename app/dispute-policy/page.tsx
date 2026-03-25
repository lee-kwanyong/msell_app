export default function DisputePolicyPage() {
  return (
    <main style={pageWrap}>
      <div style={container}>
        <div style={heroBox}>
          <div style={eyebrow}>Msell Policy</div>
          <h1 style={title}>분쟁처리 및 신고정책</h1>
          <p style={desc}>
            Msell은 허위매물, 사기 의심, 권리침해 및 기타 정책 위반 사항에 대해
            신고를 접수하고 운영상 필요한 조치를 할 수 있습니다.
          </p>
          <div style={effectiveDate}>시행일: 2026년 3월 25일</div>
        </div>

        <div style={card}>
          <Section title="1. 신고 대상">
            <Bullet
              items={[
                "허위매물",
                "사기 또는 기망 의심",
                "권리침해",
                "부적절한 광고",
                "욕설, 협박, 스팸, 외부결제 유도",
                "기타 정책 위반",
              ]}
            />
          </Section>

          <Section title="2. 신고 방법">
            <Bullet
              items={[
                "회원은 플랫폼 내 신고 기능 또는 고객센터를 통해 신고할 수 있습니다.",
                "신고 시 거래번호, 상대방 계정, 대화내역, 입증자료 등을 제출해야 할 수 있습니다.",
                "허위신고 또는 악의적 신고는 제재 대상이 될 수 있습니다.",
              ]}
            />
          </Section>

          <Section title="3. 회사의 조치">
            <Bullet
              items={[
                "게시물 임시 비노출",
                "계정 일시 제한",
                "자료 제출 및 소명 요청",
                "반복 위반자 영구 제한",
                "관계기관 협조",
              ]}
            />
          </Section>

          <Section title="4. 회사의 역할">
            <Bullet
              items={[
                "회사는 회원 간 거래의 직접 당사자가 아닙니다.",
                "회사는 플랫폼의 신뢰 보호와 이용자 보호를 위해 필요한 범위에서 운영상 조치를 취할 수 있습니다.",
                "회사의 조치는 법적 판정이 아니며, 최종 판단은 관계기관 또는 법원의 판단에 따릅니다.",
              ]}
            />
          </Section>

          <Section title="5. 제재 기준">
            <Bullet
              items={[
                "경미한 위반: 경고 또는 수정 요청",
                "반복 위반: 게시물 삭제 또는 일정기간 이용 제한",
                "중대한 위반: 영구 정지 또는 재가입 제한",
              ]}
            />
          </Section>

          <div style={noticeBox}>
            <strong style={{ color: "#2f2417" }}>신고 안내</strong>
            <p style={{ margin: "8px 0 0", lineHeight: 1.8 }}>
              외부결제 유도, 안전거래 사칭, 허위정보가 의심되면 즉시 신고해
              주세요.
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