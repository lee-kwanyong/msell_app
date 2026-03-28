export const metadata = {
  title: "이용약관 | Msell",
};

export default function TermsPage() {
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
          이용약관
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
              제1조 목적
            </h2>
            <p style={{ margin: 0 }}>
              본 약관은 Msell이 제공하는 디지털 자산 거래 정보 등록 및 거래
              당사자 연결 서비스의 이용과 관련하여 서비스와 이용자 간의 권리,
              의무 및 책임사항을 규정하는 것을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제2조 서비스의 성격
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 거래 정보를 등록하고 상대방과 연결할 수 있는 플랫폼을
              제공합니다. Msell은 직접 판매자 또는 구매자가 아니며, 개별 거래의
              당사자가 되지 않습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제3조 회원가입 및 계정관리
            </h2>
            <p style={{ margin: 0 }}>
              이용자는 정확한 정보를 바탕으로 회원가입을 해야 하며, 계정 정보의
              관리 책임은 회원 본인에게 있습니다. 타인의 정보를 도용하거나 허위
              정보를 등록한 경우 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제4조 등록 정보의 책임
            </h2>
            <p style={{ margin: 0 }}>
              회원이 등록한 자산 정보, 설명, 가격, 거래 조건의 정확성과 적법성에
              대한 책임은 해당 회원에게 있습니다. Msell은 등록 내용의 진위 또는
              완전성을 보증하지 않습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제5조 금지행위
            </h2>
            <p style={{ margin: 0 }}>
              이용자는 허위매물 등록, 사기성 유인, 타인 사칭, 비정상적 접근,
              서비스 운영 방해, 관련 법령 위반 행위를 해서는 안 됩니다. 위반 시
              게시물 숨김, 삭제, 계정 제한 또는 영구 이용정지가 이루어질 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제6조 서비스 변경 및 중단
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 운영상 또는 기술상 필요에 따라 서비스의 일부 또는 전부를
              변경하거나 중단할 수 있습니다. 중요한 변경이 있는 경우 서비스 내
              또는 별도 공지 방식으로 안내합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, margin: "0 0 10px", color: "#24170f" }}>
              제7조 면책
            </h2>
            <p style={{ margin: 0 }}>
              Msell은 회원 간 직접 거래에서 발생하는 분쟁, 손해, 계약 불이행,
              대금 미지급, 정보 오기재 등에 대해 관련 법령상 허용되는 범위 내에서
              책임을 지지 않습니다. 단, Msell의 고의 또는 중대한 과실이 있는
              경우는 예외로 합니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}