import Link from "next/link";

const POLICY_ITEMS = [
  {
    no: "01",
    title: "서비스 성격",
    body: "Msell은 디지털 자산 거래 정보를 등록하고 당사자 간 거래 연결을 돕는 플랫폼입니다.",
  },
  {
    no: "02",
    title: "거래 책임 범위",
    body: "플랫폼은 거래 중개 화면을 제공하지만 실제 계약, 대금 지급, 권리 이전의 최종 책임은 거래 당사자에게 있습니다.",
  },
  {
    no: "03",
    title: "등록 가능 자산",
    body: "계정, 채널, 도메인, 웹사이트, 쇼핑몰, 커뮤니티, 뉴스레터, 디지털 상품 등 이전 가능성이 명확한 자산만 등록할 수 있습니다.",
  },
  {
    no: "04",
    title: "등록 금지 항목",
    body: "불법 상품, 도난 자산, 타인 명의 자산, 권리관계가 불명확한 항목, 법령 또는 플랫폼 정책 위반 항목은 등록할 수 없습니다.",
  },
  {
    no: "05",
    title: "정보 정확성",
    body: "판매자는 제목, 카테고리, 가격, 설명, 이전 방식 등 핵심 정보를 사실에 맞게 작성해야 합니다.",
  },
  {
    no: "06",
    title: "허위·과장 등록 제한",
    body: "수익, 팔로워, 트래픽, 회원 수, 계약 상태를 허위 또는 과장해 등록하는 행위는 제한됩니다.",
  },
  {
    no: "07",
    title: "중복 등록 제한",
    body: "동일 자산을 중복 등록하거나 여러 계정으로 반복 노출하는 행위는 운영 기준에 따라 조정될 수 있습니다.",
  },
  {
    no: "08",
    title: "가격 정책",
    body: "가격은 판매자가 직접 입력하지만, 명백히 비정상적이거나 혼선을 유발하는 표시는 운영 검토 대상이 될 수 있습니다.",
  },
  {
    no: "09",
    title: "문의 및 협의",
    body: "거래 문의 이후의 조건 협의, 자료 제공, 검증 방식, 이전 일정은 당사자 간 합의를 기준으로 진행됩니다.",
  },
  {
    no: "10",
    title: "이전 방식 명시",
    body: "판매자는 계정 양도, 관리자 권한 이전, 도메인 이전, 파일 전달 등 실제 이전 방식을 가능한 한 구체적으로 밝혀야 합니다.",
  },
  {
    no: "11",
    title: "검수 및 노출 조정",
    body: "플랫폼은 서비스 품질 유지를 위해 일부 등록글의 노출 순서 조정, 숨김, 수정 요청 또는 삭제 조치를 할 수 있습니다.",
  },
  {
    no: "12",
    title: "신고 처리",
    body: "사기 의심, 허위 등록, 권리 침해, 부적절한 표현이 신고될 경우 운영 검토 후 제한 조치가 이뤄질 수 있습니다.",
  },
  {
    no: "13",
    title: "계정 제재",
    body: "반복 위반, 악의적 거래 방해, 허위 정보 제공, 정책 우회 시 계정 제한 또는 영구 이용 중단이 적용될 수 있습니다.",
  },
  {
    no: "14",
    title: "보증 부인",
    body: "플랫폼은 각 등록 자산의 수익성, 안정성, 법적 완전성, 실현 가능성을 보증하지 않습니다.",
  },
  {
    no: "15",
    title: "정책 변경",
    body: "운영상 필요 시 정책은 수정될 수 있으며, 주요 변경 사항은 서비스 화면 또는 관련 페이지를 통해 반영됩니다.",
  },
];

export default function PolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 96px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, #2b1d12 0%, #4a2f1b 52%, #77502d 100%)",
            borderRadius: 34,
            padding: 30,
            color: "#fffaf2",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 64px rgba(55, 35, 17, 0.16)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.16em",
              opacity: 0.8,
              marginBottom: 14,
            }}
          >
            POLICY
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                운영정책
              </h1>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "rgba(255,250,242,0.86)",
                  fontWeight: 600,
                }}
              >
                거래 등록, 문의, 검수, 신고, 제한 기준까지 Msell 운영에 필요한 핵심
                정책 15가지를 정리했습니다.
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 44,
                padding: "0 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              총 15개 정책
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {POLICY_ITEMS.map((item) => (
            <article
              key={item.no}
              style={{
                borderRadius: 28,
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                padding: 20,
                boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
                minHeight: 220,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f2e8db",
                  color: "#7f684f",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 16,
                }}
              >
                {item.no}
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#16110d",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  margin: "14px 0 0",
                  color: "#6d5945",
                  fontSize: 14,
                  lineHeight: 1.8,
                  fontWeight: 600,
                }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: 24,
            borderRadius: 30,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            padding: 24,
            boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#16110d",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                거래 전 반드시 확인하세요
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#7c6852",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.7,
                }}
              >
                등록 정보와 실제 이전 가능 범위, 수익 자료, 권리관계, 이전 절차는
                거래 전에 직접 검토해야 합니다.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/listings"
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#fffdf9",
                  border: "1px solid #e1d4c3",
                  color: "#2f2417",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                거래목록 보기
              </Link>

              <Link
                href="/listings/create"
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: "0 10px 22px rgba(47, 36, 23, 0.18)",
                }}
              >
                자산등록
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}