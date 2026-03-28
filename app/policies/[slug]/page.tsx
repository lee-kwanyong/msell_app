import Link from "next/link";
import { notFound } from "next/navigation";

type PolicyContent = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const POLICY_MAP: Record<string, PolicyContent> = {
  terms: {
    eyebrow: "TERMS",
    title: "이용약관",
    summary:
      "Msell 서비스 이용에 관한 기본 조건, 회원의 권리와 의무, 서비스 제공 범위를 안내합니다.",
    sections: [
      {
        heading: "1. 서비스 범위",
        body: [
          "Msell은 디지털 자산 거래 정보를 등록하고, 회원 간 문의 및 거래 연결 기능을 제공합니다.",
          "플랫폼은 거래 화면과 관리 기능을 제공하지만 실제 계약 체결과 대금 지급, 권리 이전의 최종 책임은 거래 당사자에게 있습니다.",
        ],
      },
      {
        heading: "2. 회원 의무",
        body: [
          "회원은 등록 정보, 연락 정보, 거래 관련 설명을 사실에 맞게 작성해야 합니다.",
          "허위 정보 등록, 타인 권리 침해, 서비스 운영 방해 행위는 제한될 수 있습니다.",
        ],
      },
      {
        heading: "3. 제한 및 해지",
        body: [
          "정책 위반, 반복 신고, 불법 자산 등록, 사기 의심 행위가 확인될 경우 계정 사용이 제한될 수 있습니다.",
          "필요 시 게시물 숨김, 삭제, 거래 기능 제한 등의 운영 조치가 적용될 수 있습니다.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "PRIVACY",
    title: "개인정보처리방침",
    summary:
      "회원가입, 거래 문의, 계정 운영 과정에서 수집되는 정보와 이용 목적을 안내합니다.",
    sections: [
      {
        heading: "1. 수집 정보",
        body: [
          "이름, 이메일, 연락처, 로그인 제공자 정보, 서비스 이용 기록이 수집될 수 있습니다.",
          "거래 문의 및 게시판 이용 시 작성 내용이 서비스 운영 기록으로 저장될 수 있습니다.",
        ],
      },
      {
        heading: "2. 이용 목적",
        body: [
          "회원 식별, 계정 보호, 거래 문의 처리, 운영 정책 집행, 서비스 개선에 사용됩니다.",
          "법령상 보관이 필요한 경우 관련 기간 동안 보관될 수 있습니다.",
        ],
      },
      {
        heading: "3. 보호 조치",
        body: [
          "접근 권한 관리, 인증 기반 접근 제한, 운영상 필요한 최소 정보 활용 원칙을 적용합니다.",
          "회원은 계정 정보 수정이나 서비스 탈퇴를 요청할 수 있습니다.",
        ],
      },
    ],
  },
  "ad-policy": {
    eyebrow: "AD POLICY",
    title: "광고 운영정책",
    summary:
      "플랫폼 내 노출되는 홍보성 콘텐츠, 프로모션, 강조 노출 운영 기준을 안내합니다.",
    sections: [
      {
        heading: "1. 광고성 노출 기준",
        body: [
          "강조 노출 또는 홍보성 소개가 포함된 자산은 일반 등록과 구분될 수 있습니다.",
          "허위, 과장, 오인 가능성이 큰 문구는 제한될 수 있습니다.",
        ],
      },
      {
        heading: "2. 제한 항목",
        body: [
          "불법 자산, 사행성, 기만성 표현, 과도한 수익 보장 문구는 광고 형태로도 허용되지 않습니다.",
          "운영 기준에 맞지 않는 경우 사전 통지 없이 노출이 중단될 수 있습니다.",
        ],
      },
    ],
  },
  "seller-policy": {
    eyebrow: "SELLER POLICY",
    title: "판매자 등록정책",
    summary:
      "판매자가 자산을 등록할 때 따라야 하는 정보 작성 기준과 제한 항목을 안내합니다.",
    sections: [
      {
        heading: "1. 등록 가능 항목",
        body: [
          "이전 가능성이 명확한 계정, 채널, 도메인, 웹사이트, 디지털 상품 등만 등록할 수 있습니다.",
          "판매자는 실제 이전 방식과 포함 범위를 가능한 한 구체적으로 밝혀야 합니다.",
        ],
      },
      {
        heading: "2. 금지 사항",
        body: [
          "타인 명의 자산, 도난 자산, 권리관계가 불분명한 자산, 불법 상품은 등록할 수 없습니다.",
          "허위 수익, 허위 트래픽, 허위 팔로워 수치로 등록하는 행위는 제한됩니다.",
        ],
      },
      {
        heading: "3. 운영 조정",
        body: [
          "중복 등록, 혼동을 유발하는 제목, 비정상 가격 등록은 숨김 또는 수정 요청 대상이 될 수 있습니다.",
          "반복 위반 시 판매 기능이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  "dispute-policy": {
    eyebrow: "DISPUTE POLICY",
    title: "분쟁처리 및 신고정책",
    summary:
      "사기 의심, 허위 등록, 권리 침해, 이용자 간 분쟁 발생 시 처리 기준을 안내합니다.",
    sections: [
      {
        heading: "1. 신고 접수",
        body: [
          "회원은 허위 등록, 사기 의심, 부적절한 표현, 정책 위반 항목을 신고할 수 있습니다.",
          "신고 접수 후 운영 검토를 통해 노출 제한, 게시물 삭제, 계정 제한이 이뤄질 수 있습니다.",
        ],
      },
      {
        heading: "2. 분쟁 대응",
        body: [
          "플랫폼은 사실관계 확인을 위한 자료 제출을 요청할 수 있습니다.",
          "플랫폼은 거래 당사자 간 분쟁의 중재 보증인이 아니며, 필요한 경우 수사기관 또는 법적 절차를 통한 해결이 필요할 수 있습니다.",
        ],
      },
      {
        heading: "3. 제재 기준",
        body: [
          "악의적 허위 신고, 반복 정책 위반, 사기 의심 행위는 서비스 이용 제한 사유가 됩니다.",
          "운영상 중대한 위험이 확인되면 사전 통지 없이 긴급 제한 조치가 적용될 수 있습니다.",
        ],
      },
    ],
  },
};

function getPolicy(slug: string) {
  return POLICY_MAP[slug];
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    notFound();
  }

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
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            color: "#8a7156",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Link
            href="/policy"
            style={{
              color: "#8a7156",
              textDecoration: "none",
            }}
          >
            ← 운영정책
          </Link>
        </div>

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
            {policy.eyebrow}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 46,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            {policy.title}
          </h1>

          <p
            style={{
              margin: "14px 0 0",
              maxWidth: 760,
              fontSize: 15,
              lineHeight: 1.75,
              color: "rgba(255,250,242,0.86)",
              fontWeight: 600,
            }}
          >
            {policy.summary}
          </p>
        </section>

        <section
          style={{
            marginTop: 24,
            display: "grid",
            gap: 16,
          }}
        >
          {policy.sections.map((section, index) => (
            <article
              key={section.heading}
              style={{
                borderRadius: 28,
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                padding: 22,
                boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 44,
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f2e8db",
                  color: "#7f684f",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#16110d",
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {section.heading}
              </h2>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      margin: 0,
                      color: "#6d5945",
                      fontSize: 14,
                      lineHeight: 1.85,
                      fontWeight: 600,
                      wordBreak: "keep-all",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}