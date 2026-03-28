export const metadata = {
  title: "개인정보처리방침 | Msell",
};

export default function PrivacyPage() {
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
          개인정보처리방침
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
              1. 수집하는 정보
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 회원가입, 로그인, 거래 문의, 고객 응대 과정에서 이름,
              이메일, 연락처, 사용자명, 서비스 이용 기록 등 서비스 제공에 필요한
              최소한의 정보를 수집할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              2. 이용 목적
            </h2>
            <p style={{ margin: 0 }}>
              수집한 개인정보는 회원 식별, 로그인 처리, 거래 당사자 연결, 고객
              문의 대응, 부정 이용 방지, 서비스 개선을 위해 사용됩니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              3. 보관 및 파기
            </h2>
            <p style={{ margin: 0 }}>
              개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 단,
              관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안
              보관할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              4. 제3자 제공
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만 법령에 근거가 있거나 이용자의 별도 동의가 있는 경우 예외로 할
              수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              5. 이용자 권리
            </h2>
            <p style={{ margin: 0 }}>
              이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할
              수 있습니다. 관련 요청은 서비스 내 문의 수단 또는 운영자 연락 채널을
              통해 접수할 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}