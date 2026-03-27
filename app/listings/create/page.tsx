import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

type CategoryRow = {
  id?: string | null;
  slug?: string | null;
  name?: string | null;
  label?: string | null;
  title?: string | null;
  created_at?: string | null;
};

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    category?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "unauthorized":
      return "로그인 후 등록할 수 있습니다.";
    case "missing_required_fields":
      return "필수 항목을 입력해 주세요.";
    case "insert_failed":
      return "등록에 실패했습니다.";
    default:
      return "";
  }
}

export default async function CreateListingPage({ searchParams }: PageProps) {
  const query = (await searchParams) || {};
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/listings/create");
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  const categories = ((categoriesData || []) as CategoryRow[])
    .map((item) => ({
      value: item.slug || item.name || item.label || item.title || "",
      label: item.label || item.name || item.title || item.slug || "",
    }))
    .filter((item) => item.value && item.label);

  const errorMessage = getErrorMessage(query.error);
  const initialCategory = query.category || "";

  return (
    <main className="ms-page ms-page--narrow">
      <section className="ms-form-shell">
        <div className="ms-form-shell__head">
          <div>
            <p className="ms-eyebrow">NEW LISTING</p>
            <h1 className="ms-form-shell__title">자산 등록</h1>
          </div>

          <Link href="/listings" className="ms-text-link">
            거래목록
          </Link>
        </div>

        {errorMessage ? <div className="ms-alert">{errorMessage}</div> : null}

        <form action="/api/listings/create" method="post" className="ms-form">
          <div className="ms-field">
            <label htmlFor="title" className="ms-label">
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="ms-input"
              placeholder="예: 유튜브 채널 매각"
            />
          </div>

          <div className="ms-field">
            <label htmlFor="category" className="ms-label">
              카테고리
            </label>
            <CategoryDropdown
              name="category"
              defaultValue={initialCategory}
              categories={categories}
              required
            />
          </div>

          <div className="ms-form__row">
            <div className="ms-field">
              <label htmlFor="price" className="ms-label">
                희망 가격
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                className="ms-input"
                placeholder="예: 5000000"
              />
            </div>

            <div className="ms-field">
              <label htmlFor="status" className="ms-label">
                상태
              </label>
              <select
                id="status"
                name="status"
                defaultValue="active"
                className="ms-input"
              >
                <option value="active">거래가능</option>
                <option value="draft">임시저장</option>
                <option value="hidden">숨김</option>
                <option value="reserved">예약중</option>
                <option value="sold">거래종료</option>
              </select>
            </div>
          </div>

          <div className="ms-field">
            <label htmlFor="transfer_method" className="ms-label">
              이전 방식
            </label>
            <input
              id="transfer_method"
              name="transfer_method"
              type="text"
              className="ms-input"
              placeholder="예: 계정 전체 이전 / 관리자 권한 이전"
            />
          </div>

          <div className="ms-field">
            <label htmlFor="description" className="ms-label">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              className="ms-textarea"
              placeholder="핵심 정보만 입력하세요."
            />
          </div>

          <div className="ms-form__actions">
            <Link href="/listings" className="ms-btn ms-btn--secondary">
              취소
            </Link>
            <button type="submit" className="ms-btn ms-btn--primary">
              자산 등록하기
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
