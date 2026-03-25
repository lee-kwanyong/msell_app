export const metadata = {
  title: '거래 안전정책',
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #eadfcf',
        borderRadius: 20,
        padding: '20px 18px',
      }}
    >
      <h2
        style={{
          margin: '0 0 10px',
          fontSize: 18,
          fontWeight: 800,
          color: '#241b11',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: '#5f4b37',
          fontSize: 14,
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
        }}
      >
        {children}
      </div>
    </section>
  )
}

export default function PolicyPage() {
  return (
    <main
      style={{
        background: '#f6f1e7',
        minHeight: '100dvh',
        padding: '24px 16px 120px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #eadfcf',
            borderRadius: 28,
            padding: '28px 22px',
            marginBottom: 16,
            boxShadow: '0 12px 30px rgba(47,36,23,0.06)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 32,
              padding: '0 12px',
              borderRadius: 999,
              background: '#f3eadf',
              color: '#6b5640',
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            SAFETY POLICY
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.25,
              color: '#241b11',
              fontWeight: 900,
            }}
          >
            Msell 거래 안전정책
          </h1>

          <p
            style={{
              margin: '12px 0 0',
              color: '#6b5640',
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            Msell은 디지털 자산 거래 과정에서 발생할 수 있는 사기, 허위정보,
            권리분쟁, 외부 유도 피해를 줄이기 위해 아래 기준을 운영합니다.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <Section title="1. 거래 전 기본 확인사항">
            거래 전 반드시 판매자 신원, 자산 소유 여부, 이전 가능성, 운영 권한,
            정책 위반 이력, 수익정보의 근거를 직접 확인해야 합니다.
            {'\n'}
            스크린샷만으로 판단하지 말고, 실제 관리권한 및 이전 가능 범위를
            검토해야 합니다.
          </Section>

          <Section title="2. 외부 메신저 유도 주의">
            플랫폼 외부로 즉시 이동을 유도하거나, 긴급 송금을 요구하거나, 기록이
            남지 않는 방식의 거래를 강하게 권하는 경우 주의해야 합니다.
            {'\n'}
            가능하면 최초 협의와 주요 합의는 Msell 내 메시지 기준으로 남기는 것이
            안전합니다.
          </Section>

          <Section title="3. 선입금·선이전 위험">
            구매자는 충분한 검토 없이 대금을 먼저 송금하지 말아야 하며,
            판매자도 보호장치 없이 핵심 자산을 먼저 이전하지 말아야 합니다.
            {'\n'}
            필요 시 단계별 검수, 증빙 제출, 합의된 절차에 따른 안전거래 방식을
            사용하는 것이 좋습니다.
          </Section>

          <Section title="4. 허위매물 및 과장정보 금지">
            존재하지 않는 자산, 과장된 매출, 조작된 통계, 제3자 권한 자산, 이전
            불가능한 자산을 등록하는 행위는 금지됩니다.
            {'\n'}
            적발 시 게시글 숨김, 삭제, 계정 제한, 내부 기록 보관 등의 조치가
            이뤄질 수 있습니다.
          </Section>

          <Section title="5. 분쟁 가능성이 높은 사례">
            다음 사례는 특히 주의가 필요합니다.
            {'\n'}- 명의 이전이 불가능한 계정 또는 채널
            {'\n'}- 제휴사 정책 위반 상태의 자산
            {'\n'}- 세금·정산 문제가 정리되지 않은 자산
            {'\n'}- 제3자의 지식재산권 침해 가능성이 있는 자산
            {'\n'}- 운영자 변경 시 수익이 급감할 가능성이 큰 자산
          </Section>

          <Section title="6. Msell의 조치 기준">
            Msell은 거래 안전을 위해 게시글 검토, 증빙 요청, 노출 제한, 계정
            제한, 문의 응대, 기록 확인 등을 수행할 수 있습니다.
            {'\n'}
            다만 개별 거래의 최종 판단과 계약 체결 책임은 당사자에게 있습니다.
          </Section>

          <Section title="7. 권장 거래 절차">
            권장 절차는 다음과 같습니다.
            {'\n'}1) 기본 정보 확인
            {'\n'}2) 메시지로 조건 협의
            {'\n'}3) 권한·수익·운영정보 검토
            {'\n'}4) 이전 방식 및 검수 기준 합의
            {'\n'}5) 단계별 지급 또는 보호장치 사용
            {'\n'}6) 최종 인수 확인 후 거래 종료
          </Section>

          <Section title="8. 신고 및 문의">
            사기 의심, 허위매물, 권리분쟁, 위조 증빙, 외부 유도 피해가 의심되는
            경우 즉시 Msell 운영팀에 신고해야 합니다.
          </Section>
        </div>
      </div>
    </main>
  )
}