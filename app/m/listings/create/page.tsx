import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const CATEGORY_OPTIONS = [
  "유튜브 채널",
  "인스타그램 계정",
  "웹사이트 / 블로그",
  "전자상거래 스토어",
  "앱 / 서비스",
  "도메인",
  "콘텐츠 페이지",
  "커뮤니티 / 카페",
  "광고 계정",
  "기타",
];

const STATUS_OPTIONS = [
  { value: "active", label: "거래가능" },
  { value: "hidden", label: "숨김" },
  { value: "draft", label: "임시저장" },
  { value: "sold", label: "거래종료" },
];

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function MobileListingCreatePage({
  searchParams,
}: PageProps) {
  const resolved = (await searchParams) ?? {};
  const error = resolved.error || "";
  const message = resolved.message || "";

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/m/auth/login?next=/m/listings/create");
  }

  return (
    <>
      <main className="msell-m-create-page">
        <section className="msell-m-create-topbar">
          <Link href="/m/listings" className="msell-m-create-back">
            목록으로
          </Link>
        </section>

        <section className="msell-m-create-hero">
          <div className="msell-m-create-badge">CREATE LISTING</div>
          <h1 className="msell-m-create-title">자산 등록</h1>
          <p className="msell-m-create-subtitle">
            모바일에서도 빠르게 등록할 수 있게 핵심 항목만 바로 입력할 수 있게
            구성했습니다.
          </p>
        </section>

        {error ? (
          <section className="msell-m-create-alert msell-m-create-alert-error">
            {error}
          </section>
        ) : null}

        {message ? (
          <section className="msell-m-create-alert msell-m-create-alert-message">
            {message}
          </section>
        ) : null}

        <form
          action="/api/listings/create"
          method="post"
          className="msell-m-create-form"
        >
          <input type="hidden" name="return_to" value="/m/listings/create" />

          <section className="msell-m-create-card">
            <div className="msell-m-create-card-head">
              <strong>기본 정보</strong>
              <span>필수 입력</span>
            </div>

            <label htmlFor="title" className="msell-m-create-label">
              <span>제목</span>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="예: 수익형 유튜브 채널 양도"
                className="msell-m-create-input"
              />
            </label>

            <label htmlFor="category" className="msell-m-create-label">
              <span>카테고리</span>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="msell-m-create-input"
              >
                <option value="" disabled>
                  카테고리 선택
                </option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="price" className="msell-m-create-label">
              <span>희망 가격</span>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                inputMode="numeric"
                placeholder="예: 5000000"
                className="msell-m-create-input"
              />
            </label>

            <label htmlFor="status" className="msell-m-create-label">
              <span>상태</span>
              <select
                id="status"
                name="status"
                defaultValue="active"
                className="msell-m-create-input"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="msell-m-create-card">
            <div className="msell-m-create-card-head">
              <strong>거래 정보</strong>
              <span>선택 입력 가능</span>
            </div>

            <label htmlFor="transfer_method" className="msell-m-create-label">
              <span>이전 방식</span>
              <input
                id="transfer_method"
                name="transfer_method"
                type="text"
                placeholder="예: 관리자 권한 이전, 계정 양도, 도메인 이전"
                className="msell-m-create-input"
              />
            </label>

            <label htmlFor="description" className="msell-m-create-label">
              <span>설명</span>
              <textarea
                id="description"
                name="description"
                rows={8}
                placeholder="자산 상태, 수익 구조, 운영 방식, 포함 항목 등을 입력하세요."
                className="msell-m-create-textarea"
              />
            </label>
          </section>

          <section className="msell-m-create-guide">
            <div className="msell-m-create-guide-head">입력 팁</div>
            <ul className="msell-m-create-guide-list">
              <li>제목에는 자산 유형과 핵심 포인트를 같이 적는 게 좋다.</li>
              <li>설명에는 수익 구조, 운영 기간, 인수 방식까지 적으면 좋다.</li>
              <li>아직 공개하기 애매하면 상태를 임시저장이나 숨김으로 둘 수 있다.</li>
            </ul>
          </section>

          <section className="msell-m-create-actions">
            <button type="submit" className="msell-m-create-primary">
              자산 등록
            </button>
            <Link href="/m/listings" className="msell-m-create-secondary">
              취소
            </Link>
          </section>
        </form>
      </main>

      <style>{`
        .msell-m-create-page {
          width: 100%;
          padding: 12px 12px 0;
          box-sizing: border-box;
          display: grid;
          gap: 14px;
        }

        .msell-m-create-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .msell-m-create-back {
          height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #dfd0bb;
          background: #fffdfa;
          color: #2f2417;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        .msell-m-create-hero {
          padding: 8px 2px 0;
        }

        .msell-m-create-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f1e6d6;
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .msell-m-create-title {
          margin: 12px 0 8px;
          color: #1f140c;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-m-create-subtitle {
          margin: 0;
          color: #7e6850;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }

        .msell-m-create-alert {
          padding: 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-m-create-alert-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .msell-m-create-alert-message {
          border: 1px solid #d9d2c3;
          background: #f8f3ea;
          color: #5b4631;
        }

        .msell-m-create-form {
          display: grid;
          gap: 14px;
        }

        .msell-m-create-card {
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-m-create-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .msell-m-create-card-head strong {
          color: #1f140c;
          font-size: 16px;
          font-weight: 900;
        }

        .msell-m-create-card-head span {
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
        }

        .msell-m-create-label {
          display: grid;
          gap: 8px;
        }

        .msell-m-create-label span {
          color: #8f7658;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-m-create-input,
        .msell-m-create-textarea {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e5ddd2;
          background: #ffffff;
          color: #2b1d12;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .msell-m-create-input {
          height: 52px;
          padding: 0 16px;
        }

        .msell-m-create-textarea {
          padding: 14px 16px;
          resize: vertical;
          min-height: 168px;
          line-height: 1.65;
        }

        .msell-m-create-input::placeholder,
        .msell-m-create-textarea::placeholder {
          color: #b4a089;
        }

        .msell-m-create-input:focus,
        .msell-m-create-textarea:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
          transform: translateY(-1px);
        }

        .msell-m-create-guide {
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: #fffdfa;
        }

        .msell-m-create-guide-head {
          color: #1f140c;
          font-size: 15px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .msell-m-create-guide-list {
          margin: 0;
          padding-left: 18px;
          color: #6f5a45;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 600;
          display: grid;
          gap: 6px;
        }

        .msell-m-create-actions {
          display: grid;
          gap: 10px;
        }

        .msell-m-create-primary,
        .msell-m-create-secondary {
          width: 100%;
          height: 52px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-sizing: border-box;
        }

        .msell-m-create-primary {
          border: none;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.18);
          cursor: pointer;
        }

        .msell-m-create-secondary {
          border: 1px solid #dfd0bb;
          background: #eadfcf;
          color: #2f2417;
        }

        @media (max-width: 380px) {
          .msell-m-create-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .msell-m-create-title {
            font-size: 28px;
          }

          .msell-m-create-card,
          .msell-m-create-guide {
            padding: 12px;
            border-radius: 20px;
          }

          .msell-m-create-input,
          .msell-m-create-primary,
          .msell-m-create-secondary {
            height: 50px;
            font-size: 13px;
          }

          .msell-m-create-textarea {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}