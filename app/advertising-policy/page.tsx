export const metadata = {
  title: "광고 운영정책 | Msell",
};

export default function AdvertisingPolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "40px 16px 120px",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "#fffdf9",
          border: "1px solid #e3d7c8",
          borderRadius: 24,
          padding: "28px 20px",
          boxShadow: "0 10px 30px rgba(47, 36, 23, 0.06)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.2,
            color: "#24170f",
            fontWeight: 800,
          }}
        >
          광고 운영정책
        </h1>

        <p style={{ marginTop: 12, color: "#7b624d", fontSize: 14 }}>
          최종 업데이트: 2026-03-28
        </p>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gap: 24,
            color: "#3f3126",
            fontSize: 15,
            lineHeight: 1.9,
          }}
        >
          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              1. 기본 원칙
            </h2>
            <p style={{ margin: 0 }}>
              Msell 내 광고 또는 홍보성 콘텐츠는 이용자에게 혼동을 주지 않도록
              일반 거래 정보와 명확히 구분되어야 합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              2. 광고 표시 기준
            </h2>
            <p style={{ margin: 0 }}>
              광고, 제휴, 프로모션, 후원성 콘텐츠는 이용자가 일반 게시물로
              오인하지 않도록 적절한 표시가 이루어져야 합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              3. 금지되는 광고
            </h2>
            <p style={{ margin: 0 }}>
              허위·과장 표현, 타인 사칭, 불법 서비스 유도, 검증되지 않은 수익
              보장 문구, 관계 법령 위반 가능성이 있는 광고는 게재할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              4. 운영 조치
            </h2>
            <p style={{ margin: 0 }}>
              운영정책에 위반되는 광고성 게시물은 사전 통지 없이 숨김, 수정
              요청, 삭제 처리될 수 있으며, 반복 위반 시 계정 제재가 이루어질 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              5. 책임과 제한
            </h2>
            <p style={{ margin: 0 }}>
              광고 내용의 적법성, 정확성, 권리관계에 대한 책임은 해당 광고를
              등록한 회원 또는 광고주에게 있으며, Msell은 관련 법령상 허용되는
              범위 내에서 플랫폼 운영자로서 필요한 조치를 할 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}