export const metadata = {
  title: "분쟁처리 및 신고정책 | Msell",
};

export default function DisputePolicyPage() {
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
          분쟁처리 및 신고정책
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
              1. 신고 접수
            </h2>
            <p style={{ margin: 0 }}>
              이용자는 허위 등록, 사칭, 부정 행위, 거래 방해 등 문제가 있는 경우
              운영자에게 신고할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              2. 검토 절차
            </h2>
            <p style={{ margin: 0 }}>
              신고가 접수되면 관련 자료와 서비스 내 기록을 바탕으로 검토하며,
              필요시 게시물 숨김, 계정 제한, 추가 자료 요청 등의 조치를 할 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              3. 분쟁 관련 안내
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 플랫폼 운영자로서 신고 접수와 기본적인 사실관계 확인을
              지원할 수 있으나, 개별 거래의 법적 책임 판단이나 금전적 배상 주체가
              되지는 않습니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}