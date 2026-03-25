export default function PrivacyPage() {
  return (
    <main style={pageWrap}>
      <div style={container}>
        <div style={heroBox}>
          <div style={eyebrow}>Msell Policy</div>
          <h1 style={title}>개인정보처리방침</h1>
          <p style={desc}>
            Msell은 이용자의 개인정보를 중요하게 생각하며, 관련 법령에 따라
            개인정보를 적법하고 안전하게 처리합니다.
          </p>
          <div style={effectiveDate}>시행일: 2026년 3월 25일</div>
        </div>

        <div style={card}>
          <Section title="1. 수집하는 개인정보 항목">
            <SubTitle>회원가입 및 계정관리</SubTitle>
            <Bullet
              items={[
                "이메일",
                "휴대폰번호",
                "비밀번호",
                "닉네임 또는 이름",
              ]}
            />

            <SubTitle>거래 및 서비스 이용</SubTitle>
            <Bullet
              items={[
                "거래 문의 내역",
                "메시지 내역",
                "신고 내역",
                "거래기록",
                "접속기록",
                "IP 주소",
                "기기 및 브라우저 정보",
                "쿠키 및 로그정보",
              ]}
            />

            <SubTitle>유료서비스 이용</SubTitle>
            <Bullet items={["결제 관련 정보", "환불 관련 정보", "광고 담당자 정보"]} />

            <SubTitle>고객문의</SubTitle>
            <Bullet items={["이름", "연락처", "문의 내용", "첨부자료"]} />
          </Section>

          <Section title="2. 개인정보 이용 목적">
            <Bullet
              items={[
                "회원 식별 및 계정관리",
                "거래 문의 및 서비스 제공",
                "광고, 상위노출 및 유료서비스 제공",
                "수수료 부과, 결제, 환불 처리",
                "부정이용 방지 및 보안관리",
                "분쟁처리 및 고객응대",
                "서비스 품질 개선 및 운영분석",
                "법령상 의무 이행",
              ]}
            />
          </Section>

          <Section title="3. 개인정보 보유 및 이용기간">
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체
            없이 파기합니다. 다만, 관계 법령에 따라 일정 기간 보존이 필요한 경우
            해당 기간 동안 안전하게 보관합니다.
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만
            아래의 경우 예외로 합니다.
            <Bullet
              items={[
                "이용자가 사전에 동의한 경우",
                "법령에 따라 제공이 필요한 경우",
                "수사기관, 법원, 행정기관의 적법한 요청이 있는 경우",
                "분쟁 해결을 위해 필요한 범위 내에서 제공이 필요한 경우",
              ]}
            />
          </Section>

          <Section title="5. 개인정보 처리위탁">
            회사는 서비스 운영을 위하여 필요한 경우 일부 업무를 외부 업체에
            위탁할 수 있으며, 위탁 시 관련 법령에 따라 안전하게 관리합니다.
          </Section>

          <Section title="6. 이용자의 권리">
            이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제,
            처리정지를 요청할 수 있습니다.
          </Section>

          <Section title="7. 개인정보의 파기">
            회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우, 해당
            정보를 복구 또는 재생되지 않는 방법으로 지체 없이 파기합니다.
          </Section>

          <Section title="8. 개인정보의 안전성 확보조치">
            <Bullet
              items={[
                "접근권한 관리",
                "비밀번호 및 중요정보 암호화",
                "접속기록 보관",
                "보안점검 및 내부관리계획 운영",
                "권한 없는 접근 방지 조치",
              ]}
            />
          </Section>

          <Section title="9. 쿠키의 사용">
            회사는 서비스 이용 편의성과 통계 분석을 위해 쿠키를 사용할 수
            있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수
            있으나, 일부 기능 이용이 제한될 수 있습니다.
          </Section>

          <Section title="10. 개인정보 보호책임자">
            <div style={infoBox}>
              <div>이메일: privacy@msell.co.kr</div>
              <div>문의처: 고객센터 또는 문의 페이지</div>
            </div>
          </Section>

          <Section title="11. 고지의 의무">
            본 개인정보처리방침은 관련 법령, 정책 또는 서비스 변경에 따라
            수정될 수 있으며, 변경 시 서비스 내 공지합니다.
          </Section>

          <div style={bottomNote}>
            부칙: 본 방침은 2026년 3월 25일부터 시행합니다.
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return <div style={subTitle}>{children}</div>;
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

const subTitle: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 6,
  fontSize: 15,
  fontWeight: 800,
  color: "#2f2417",
};

const list: React.CSSProperties = {
  margin: "6px 0 0",
  paddingLeft: 20,
};

const listItem: React.CSSProperties = {
  marginBottom: 6,
};

const infoBox: React.CSSProperties = {
  background: "#fcfaf6",
  border: "1px solid #efe2cf",
  borderRadius: 16,
  padding: "14px 16px",
};

const bottomNote: React.CSSProperties = {
  paddingTop: 20,
  fontSize: 14,
  color: "#7b6548",
  fontWeight: 700,
};