export default function TermsPage() {
  return (
    <main style={pageWrap}>
      <div style={container}>
        <div style={heroBox}>
          <div style={eyebrow}>Msell Policy</div>
          <h1 style={title}>이용약관</h1>
          <p style={desc}>
            본 이용약관은 Msell이 제공하는 디지털 자산 거래 정보 제공, 회원 간
            거래 연결, 광고 노출, 상위노출 및 기타 부가서비스의 이용과 관련한
            권리, 의무 및 책임사항을 규정합니다.
          </p>
          <div style={effectiveDate}>시행일: 2026년 3월 25일</div>
        </div>

        <div style={card}>
          <Section title="제1조 목적">
            이 약관은 회사가 운영하는 Msell 플랫폼에서 제공하는 서비스의 이용과
            관련하여 회사와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을
            정하는 것을 목적으로 합니다.
          </Section>

          <Section title="제2조 정의">
            <List
              items={[
                "“플랫폼”이란 회사가 인터넷 또는 모바일 환경에서 제공하는 Msell 서비스를 말합니다.",
                "“회원”이란 본 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.",
                "“판매회원”이란 플랫폼에 거래대상을 등록하거나 광고를 게재하는 회원을 말합니다.",
                "“구매회원”이란 플랫폼을 통해 거래대상을 검색, 문의 또는 거래하려는 회원을 말합니다.",
                "“거래대상”이란 회사가 허용한 범위 내에서 회원이 등록한 디지털 자산, 운영권, 온라인 자산, 기타 거래 가능한 항목을 말합니다.",
                "“유료서비스”란 상위노출, 배너광고, 기타 회사가 유상으로 제공하는 서비스 상품을 말합니다.",
              ]}
            />
          </Section>

          <Section title="제3조 서비스의 성격">
            <List
              items={[
                "회사는 회원 간 거래를 직접 체결하거나 당사자가 되는 사업자가 아니며, 거래 정보 제공, 광고 노출, 검색, 문의 전달, 연결 기능을 제공하는 플랫폼입니다.",
                "회사는 회원이 등록한 거래대상의 진정성, 권리귀속, 적법성, 안전성, 거래 성사 가능성 또는 수익성을 보증하지 않습니다.",
                "회사는 거래환경 개선과 분쟁 예방을 위해 필요한 범위에서 게시물 관리, 회원 제한, 신고 처리 등의 조치를 할 수 있습니다.",
              ]}
            />
          </Section>

          <Section title="제4조 회원가입 및 계정관리">
            <List
              items={[
                "회원은 정확하고 최신의 정보를 제공해야 하며, 허위 정보를 제공해서는 안 됩니다.",
                "회원은 자신의 계정을 직접 관리해야 하며, 타인에게 양도, 대여하거나 공동 사용하게 해서는 안 됩니다.",
                "회사는 서비스 신뢰성 확보를 위해 회원에게 본인확인, 연락처 확인 또는 추가 자료 제출을 요청할 수 있습니다.",
              ]}
            />
          </Section>

          <Section title="제5조 거래대상 등록 및 책임">
            <List
              items={[
                "판매회원은 본인이 적법하게 보유하거나 처분할 권한이 있는 거래대상만 등록할 수 있습니다.",
                "판매회원은 거래대상의 내용, 가격, 조건, 제한사항, 이전 방식 등 핵심 정보를 정확하게 기재해야 합니다.",
                "허위, 과장, 기만, 권리침해, 약관위반 소지가 있는 거래대상은 등록이 제한될 수 있습니다.",
                "등록된 게시물의 내용과 그로 인해 발생하는 책임은 원칙적으로 해당 회원에게 있습니다.",
              ]}
            />
          </Section>

          <Section title="제6조 금지행위">
            <List
              items={[
                "허위매물 또는 존재하지 않는 거래대상 등록",
                "타인 명의 자산, 무권한 자산, 권리침해 자산 등록",
                "사기, 기망, 시세조작, 허위홍보, 허위리뷰 작성",
                "타인 개인정보 도용 또는 무단 수집",
                "회사 승인 없는 외부결제 유도, 메신저 유도, 스팸 행위",
                "서비스 운영을 방해하거나 회사 또는 제3자의 권리를 침해하는 행위",
                "법령, 공서양속 또는 본 약관과 정책에 위반되는 행위",
              ]}
            />
          </Section>

          <Section title="제7조 유료서비스">
            <List
              items={[
                "회사는 상위노출, 배너광고 및 기타 부가서비스를 유료로 제공할 수 있습니다.",
                "유료서비스는 광고 또는 프로모션 목적의 서비스이며, 거래 안전성, 적법성, 거래 성사 또는 신뢰도를 회사가 보증한다는 의미가 아닙니다.",
                "유료서비스의 노출 위치, 기간, 방식, 가격은 회사 정책 또는 개별 안내에 따릅니다.",
              ]}
            />
          </Section>

          <Section title="제8조 수수료 및 결제">
            <List
              items={[
                "회사는 유료서비스 이용 또는 거래 연결에 따라 별도의 이용요금 또는 수수료를 부과할 수 있습니다.",
                "수수료, 결제 방식, 환불 기준, 과금 시점은 서비스 화면 또는 별도 정책에 따릅니다.",
                "회원은 유료서비스 또는 거래수수료 정책을 확인한 뒤 서비스를 이용해야 합니다.",
              ]}
            />
          </Section>

          <Section title="제9조 게시물 관리">
            <List
              items={[
                "회사는 등록된 게시물이 법령, 약관, 운영정책에 위반되거나 이용자 보호에 문제가 있다고 판단되는 경우, 사전 통지 없이 수정 요청, 비공개, 삭제, 노출 제한 등의 조치를 할 수 있습니다.",
                "회사는 분쟁, 신고 또는 권리침해 주장 등이 접수된 경우 관련 게시물을 임시 제한할 수 있습니다.",
              ]}
            />
          </Section>

          <Section title="제10조 신고 및 분쟁처리">
            <List
              items={[
                "회원은 허위매물, 사기 의심, 권리침해, 부적절한 광고 등 정책 위반 사항을 회사에 신고할 수 있습니다.",
                "회사는 신고 접수 시 필요한 범위에서 자료 제출, 소명 요청, 게시물 차단, 계정 제한 등의 조치를 할 수 있습니다.",
                "회사의 조치는 플랫폼 운영상 조치이며, 법적 분쟁의 최종 판단은 관계기관 또는 법원의 판단에 따릅니다.",
              ]}
            />
          </Section>

          <Section title="제11조 서비스 이용제한">
            <List
              items={[
                "본 약관 또는 운영정책 위반",
                "허위자료 제출 또는 반복적인 신고 누적",
                "사기, 권리침해, 불법행위 의심",
                "서비스 운영 방해 또는 회사 신뢰도 훼손",
                "기타 회사가 서비스 운영상 필요하다고 판단하는 경우",
              ]}
            />
          </Section>

          <Section title="제12조 책임제한">
            <List
              items={[
                "회사는 천재지변, 시스템 장애, 통신 장애 등 불가항력적 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.",
                "회사는 회사의 고의 또는 중대한 과실이 없는 한 회원 상호 간 거래로 인한 손해에 대해 책임을 지지 않습니다.",
                "회사는 회원이 등록한 정보의 정확성, 적법성, 완전성 및 거래 성사 여부를 보증하지 않습니다.",
              ]}
            />
          </Section>

          <Section title="제13조 약관의 변경">
            회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을
            변경할 수 있으며, 변경 시 시행일 및 변경 사유를 서비스 내에
            공지합니다.
          </Section>

          <Section title="제14조 준거법 및 관할">
            본 약관은 대한민국 법률에 따르며, 서비스 이용과 관련하여 회사와
            회원 간 발생한 분쟁은 회사 본점 소재지를 관할하는 법원을 전속적
            합의관할로 합니다.
          </Section>

          <div style={bottomNote}>부칙: 본 약관은 2026년 3월 25일부터 시행합니다.</div>
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

function List({ items }: { items: string[] }) {
  return (
    <ol style={list}>
      {items.map((item, idx) => (
        <li key={`${idx}-${item.slice(0, 12)}`} style={listItem}>
          {item}
        </li>
      ))}
    </ol>
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
  margin: 0,
  paddingLeft: 20,
};

const listItem: React.CSSProperties = {
  marginBottom: 8,
};

const bottomNote: React.CSSProperties = {
  paddingTop: 20,
  fontSize: 14,
  color: "#7b6548",
  fontWeight: 700,
};