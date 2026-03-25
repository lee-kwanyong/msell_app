import Link from "next/link";

export default function AdvertisePage() {
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
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 28,
            padding: "32px 24px",
            boxShadow: "0 18px 50px rgba(47,36,23,0.06)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 999,
              background: "#f4ede2",
              color: "#6b5640",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            AD / PROMOTION
          </div>

          <h1
            style={{
              margin: "16px 0 10px",
              fontSize: 34,
              lineHeight: 1.15,
              letterSpacing: "-0.04em",
              color: "#2f2417",
            }}
          >
            광고 문의 / 상위 고정 노출 문의
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: 15,
              lineHeight: 1.8,
              color: "#6f5c47",
            }}
          >
            Msell 메인 노출, 리스트 상단 고정, 배너형 노출, 제휴 프로모션 등에
            대한 문의를 남겨주세요. 접수된 문의는 운영진이 검토 후 순차적으로
            안내드립니다.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <Link href="/advertise/inquiry" style={primaryButtonStyle}>
              문의 작성하기
            </Link>

            <Link href="/listings" style={secondaryButtonStyle}>
              거래목록 보기
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              title: "상위 고정 노출",
              desc: "특정 카테고리 또는 메인 리스트 상단에 일정 기간 우선 노출",
            },
            {
              title: "배너/홍보 영역",
              desc: "홈/카테고리/상세 페이지 내 프로모션형 광고 배치",
            },
            {
              title: "맞춤 제휴 문의",
              desc: "브랜드 협업, 공동 캠페인, 파트너십 제안 접수",
            },
            {
              title: "운영진 직접 검토",
              desc: "접수된 문의는 어드민 페이지에서 바로 확인하고 관리 가능",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "#ffffff",
                border: "1px solid #eadfcf",
                borderRadius: 22,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#2f2417",
                  marginBottom: 8,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#6f5c47",
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: 48,
  padding: "0 18px",
  borderRadius: 14,
  textDecoration: "none",
  background: "#2f2417",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 800,
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: 48,
  padding: "0 18px",
  borderRadius: 14,
  textDecoration: "none",
  background: "#eadfcf",
  color: "#2f2417",
  fontSize: 14,
  fontWeight: 800,
  border: "1px solid #dccbb3",
};