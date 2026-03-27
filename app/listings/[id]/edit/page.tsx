import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

type ListingRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  category: string | null;
  price: number | string | null;
  description: string | null;
  status: string | null;
};

type CategoryRow = {
  id?: string | null;
  slug?: string | null;
  name?: string | null;
  label?: string | null;
  title?: string | null;
  created_at?: string | null;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "unauthorized":
      return "수정 권한이 없습니다.";
    case "missing_required_fields":
      return "필수 항목을 입력해 주세요.";
    case "update_failed":
      return "수정에 실패했습니다.";
    case "not_found":
      return "자산을 찾을 수 없습니다.";
    default:
      return "";
  }
}

function extractTransferMethod(description: string | null) {
  if (!description) {
    return {
      transferMethod: "",
      cleanDescription: "",
    };
  }

  const match = description.match(/^\[이전 방식\]\s*(.+?)\n\n/s);

  if (!match) {
    return {
      transferMethod: "",
      cleanDescription: description,
    };
  }

  const transferMethod = match[1]?.trim() || "";
  const cleanDescription = description
    .replace(/^\[이전 방식\]\s*.+?\n\n/s, "")
    .trim();

  return {
    transferMethod,
    cleanDescription,
  };
}

export default async function EditListingPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = (await searchParams) || {};
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/listings/${id}/edit`);
  }

  const { data: listingData, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (listingError || !listingData) {
    notFound();
  }

  const listing = listingData as ListingRow;

  if (listing.user_id && listing.user_id !== user.id) {
    redirect(`/listings/${id}?error=unauthorized`);
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

  const { transferMethod, cleanDescription } = extractTransferMethod(
    listing.description || ""
  );

  const errorMessage = getErrorMessage(query.error);

  return (
    <main className="ms-page ms-page--narrow">
      <section className="ms-form-shell">
        <div className="ms-form-shell__head">
          <div>
            <p className="ms-eyebrow">EDIT LISTING</p>
            <h1 className="ms-form-shell__title">자산 수정</h1>
          </div>

          <Link href={`/listings/${id}`} className="ms-text-link">
            상세보기
          </Link>
        </div>

        {errorMessage ? <div className="ms-alert">{errorMessage}</div> : null}

        <form action="/api/listings/update" method="post" className="ms-form">
          <input type="hidden" name="id" value={listing.id} />

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
              defaultValue={listing.title || ""}
              placeholder="예: 유튜브 채널 매각"
            />
          </div>

          <div className="ms-field">
            <label htmlFor="category" className="ms-label">
              카테고리
            </label>
            <CategoryDropdown
              name="category"
              defaultValue={listing.category || ""}
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
                defaultValue={
                  listing.price === null || listing.price === undefined
                    ? ""
                    : String(listing.price)
                }
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
                defaultValue={listing.status || "active"}
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
              defaultValue={transferMethod}
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
              defaultValue={cleanDescription}
              placeholder="핵심 정보만 입력하세요."
            />
          </div>

          <div className="ms-form__actions">
            <Link href={`/listings/${id}`} className="ms-btn ms-btn--secondary">
              취소
            </Link>
            <button type="submit" className="ms-btn ms-btn--primary">
              수정 저장
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}