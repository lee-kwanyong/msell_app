import Link from "next/link";
import InstallCard from "@/components/pwa/InstallCard";

const trendPoints = [0, 72, 0, 0, 0, 0];
const trendLabels = ["1월", "2월", "3월", "4월", "5월", "6월"];

const topItems = [
  {
    rank: 1,
    title: "유튜브 계정 거래 합니다",
    category: "youtube",
    price: "₩33,000,000",
    status: "거래가능",
  },
  {
    rank: 2,
    title: "쇼핑몰 운영권",
    category: "website",
    price: "₩20,000,000",
    status: "거래가능",
  },
  {
    rank: 3,
    title: "텔레그램 회원5천명 방 운영권 거래합니다",
    category: "other",
    price: "₩10,000,000",
    status: "거래가능",
  },
  {
    rank: 4,
    title: "인스타그램 계정 판매",
    category: "instagram",
    price: "₩10,000,000",
    status: "거래가능",
  },
];

export default function HomePage() {
  return (
    <main style={pageWrap}>
      <div style={shell}>
        <section style={topGrid}>
          <div style={heroCard}>
            <div style={heroBadge}>MSELL · DIGITAL ASSET DEAL FLOW</div>
            <h1 style={heroTitle}>
              디지털 자산 거래 흐름을
              <br />
              더 명확하게 관리하세요
            </h1>
            <p style={heroDesc}>
              게시물 등록부터 문의, 협의, 거래 진행까지 한눈에 보이는 구조로
              정리했습니다. 브라운 톤의 차분한 경험 위에 데이터와 거래 흐름을
              함께 담았습니다.
            </p>

            <div style={heroButtons}>
              <Link href="/listings" style={primaryButton}>
                매물 둘러보기
              </Link>
              <Link href="/listings/create" style={secondaryButton}>
                자산 등록하기
              </Link>
            </div>
          </div>

          <div style={rightColumn}>
            <div style={miniCard}>
              <div style={miniTitle}>거래금액 기반 시야</div>
              <div style={miniDesc}>
                게시물 개수 대신 최근 등록 자산의 거래금액을 바로 파악할 수
                있습니다.
              </div>
            </div>

            <div style={miniCard}>
              <div style={miniTitle}>상태 기반 관리</div>
              <div style={miniDesc}>
                거래가능, 예약중, 거래종료 상태를 구분하면서 가격 흐름까지 함께
                볼 수 있습니다.
              </div>
            </div>
          </div>
        </section>

        <section style={installSection}>
          <InstallCard />
        </section>

        <section style={statsGrid}>
          <StatCard
            label="총 공개 자산가치"
            value="₩73,000,000"
            sub="전체 공개 게시물 기준"
          />
          <StatCard label="내 자산가치" value="₩0" sub="로그인 계정 기준" />
          <StatCard label="거래 가능 자산" value="4개" sub="active 기준" />
          <StatCard label="최근 가격 데이터" value="4건" sub="차트 반영 게시물 수" />
        </section>

        <section style={contentGrid}>
          <div style={panel}>
            <div style={panelHeader}>
              <div>
                <h2 style={panelTitle}>시장 거래금액 추이</h2>
                <p style={panelDesc}>
                  월별 등록 게시물 가격 합계를 기준으로 시장 흐름을 표시합니다.
                </p>
              </div>
            </div>

            <div style={chartWrap}>
              <div style={gridLineTop}>
                <span>83,950,000</span>
              </div>
              <div style={gridLineMid}>
                <span>62,962,500</span>
              </div>
              <div style={gridLineBottom}>
                <span>41,975,000</span>
              </div>

              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={svg}>
                <polyline
                  fill="none"
                  stroke="#2f2417"
                  strokeWidth="0.7"
                  points={buildPolylinePoints(trendPoints)}
                />
                {trendPoints.map((value, idx) => (
                  <circle
                    key={idx}
                    cx={10 + idx * 16}
                    cy={90 - value}
                    r={idx === 1 ? 1.35 : 0.85}
                    fill="#2f2417"
                  />
                ))}
              </svg>

              <div style={xLabels}>
                {trendLabels.map((label) => (
                  <span key={label} style={xLabel}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={panel}>
            <div style={panelHeader}>
              <div>
                <h2 style={panelTitle}>인기 자산</h2>
                <p style={panelDesc}>
                  공개 게시물 중 가격 기준 상위 항목입니다.
                </p>
              </div>
            </div>

            <div style={rankList}>
              {topItems.map((item) => (
                <div key={item.rank} style={rankCard}>
                  <div style={rankLeft}>
                    <div style={rankNumber}>{item.rank}</div>
                    <div>
                      <div style={rankTitle}>{item.title}</div>
                      <div style={rankCategory}>{item.category}</div>
                    </div>
                  </div>

                  <div style={rankRight}>
                    <div style={rankPrice}>{item.price}</div>
                    <div style={rankStatus}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
      <div style={statSub}>{sub}</div>
    </div>
  );
}

function buildPolylinePoints(values: number[]) {
  return values
    .map((value, idx) => `${10 + idx * 16},${90 - value}`)
    .join(" ");
}

const pageWrap: React.CSSProperties = {
  background: "#f6f1e7",
  padding: "24px 0 40px",
};

const shell: React.CSSProperties = {
  maxWidth: 1480,
  margin: "0 auto",
  padding: "0 32px",
};

const topGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.65fr 1fr",
  gap: 18,
};

const heroCard: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(243,235,223,0.92))",
  border: "1px solid #e7dbc8",
  borderRadius: 34,
  padding: "34px 34px",
  boxShadow: "0 20px 45px rgba(47,36,23,0.06)",
};

const heroBadge: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#8a6f4d",
  letterSpacing: "0.06em",
};

const heroTitle: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 58,
  lineHeight: 1.08,
  letterSpacing: "-0.03em",
  fontWeight: 900,
  color: "#20170f",
};

const heroDesc: React.CSSProperties = {
  margin: "18px 0 0",
  maxWidth: 760,
  fontSize: 16,
  lineHeight: 1.9,
  color: "#68553c",
};

const heroButtons: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 24,
};

const primaryButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#2f2417",
  color: "#f6f1e7",
  padding: "14px 20px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  boxShadow: "0 12px 24px rgba(47,36,23,0.14)",
};

const secondaryButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#eadfcf",
  color: "#2f2417",
  padding: "14px 20px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
};

const rightColumn: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const miniCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid #e7dbc8",
  borderRadius: 28,
  padding: "28px 24px",
  boxShadow: "0 14px 34px rgba(47,36,23,0.04)",
};

const miniTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#2f2417",
};

const miniDesc: React.CSSProperties = {
  marginTop: 10,
  fontSize: 15,
  lineHeight: 1.8,
  color: "#7a6447",
};

const installSection: React.CSSProperties = {
  marginTop: 18,
};

const statsGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
};

const statCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 28,
  padding: "24px 22px",
  boxShadow: "0 14px 34px rgba(47,36,23,0.04)",
};

const statLabel: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "#6f5b42",
};

const statValue: React.CSSProperties = {
  marginTop: 12,
  fontSize: 28,
  lineHeight: 1.15,
  fontWeight: 900,
  color: "#20170f",
};

const statSub: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: "#90795b",
};

const contentGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "1.75fr 0.95fr",
  gap: 18,
  alignItems: "start",
};

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e7dbc8",
  borderRadius: 32,
  padding: "22px 20px 20px",
  boxShadow: "0 16px 36px rgba(47,36,23,0.05)",
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "4px 4px 10px",
};

const panelTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#20170f",
};

const panelDesc: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#7d684d",
};

const chartWrap: React.CSSProperties = {
  position: "relative",
  marginTop: 10,
  height: 430,
  borderRadius: 28,
  border: "1px solid #eadfcf",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,246,239,0.96))",
  padding: "26px 20px 44px",
  overflow: "hidden",
};

const gridLineBase: React.CSSProperties = {
  position: "absolute",
  left: 18,
  right: 18,
  borderTop: "1px dashed #eadfce",
  color: "#9a8365",
  fontSize: 12,
  fontWeight: 700,
  paddingTop: 8,
};

const gridLineTop: React.CSSProperties = {
  ...gridLineBase,
  top: 42,
};

const gridLineMid: React.CSSProperties = {
  ...gridLineBase,
  top: 132,
};

const gridLineBottom: React.CSSProperties = {
  ...gridLineBase,
  top: 222,
};

const svg: React.CSSProperties = {
  position: "absolute",
  left: 18,
  right: 18,
  top: 40,
  bottom: 56,
  width: "calc(100% - 36px)",
  height: "calc(100% - 96px)",
};

const xLabels: React.CSSProperties = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 16,
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
};

const xLabel: React.CSSProperties = {
  textAlign: "center",
  fontSize: 12,
  color: "#8a7355",
  fontWeight: 700,
};

const rankList: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 10,
};

const rankCard: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  background: "#fffdfa",
  border: "1px solid #eadfcf",
  borderRadius: 24,
  padding: "16px 16px",
};

const rankLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minWidth: 0,
};

const rankNumber: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  background: "#f3eadc",
  color: "#7a6447",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 18,
};

const rankTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: "#2f2417",
  lineHeight: 1.4,
};

const rankCategory: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  color: "#8a7256",
};

const rankRight: React.CSSProperties = {
  textAlign: "right",
  minWidth: 110,
};

const rankPrice: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#20170f",
};

const rankStatus: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  fontWeight: 800,
  color: "#179c4b",
};