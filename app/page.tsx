import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "가격 협의";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("ko-KR")}원`;
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "active":
      return "거래가능";
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "hidden":
      return "숨김";
    case "draft":
      return "임시저장";
    case "pending_review":
      return "검토중";
    case "rejected":
      return "반려";
    case "archived":
      return "보관";
    default:
      return status || "-";
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,category,price,status,created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  const safeListings = (listings || []) as ListingRow[];

  return (
    <main className="ms-page">
      <section className="ms-hero">
        <div className="ms-hero__content">
          <p className="ms-eyebrow">DIGITAL ASSET MARKETPLACE</p>
          <h1 className="ms-hero__title">디지털 자산 거래를 더 간결하게</h1>
          <p className="ms-hero__desc">
            복잡한 설명 없이, 등록된 자산을 보고 바로 거래를 시작할 수 있습니다.
          </p>

          <div className="ms-hero__actions">
            <Link href="/listings" className="ms-btn ms-btn--primary">
              거래목록 보기
            </Link>
            <Link href="/listings/create" className="ms-btn ms-btn--secondary">
              등록하기
            </Link>
          </div>
        </div>
      </section>

      <section className="ms-section">
        <div className="ms-section__head">
          <div>
            <p className="ms-eyebrow">LIVE LISTINGS</p>
            <h2 className="ms-section__title">최신 등록 자산</h2>
          </div>

          <Link href="/listings" className="ms-text-link">
            전체 보기
          </Link>
        </div>

        {safeListings.length === 0 ? (
          <div className="ms-empty">
            <p>등록된 거래가능 자산이 없습니다.</p>
          </div>
        ) : (
          <div className="ms-grid ms-grid--listings">
            {safeListings.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="ms-listing-card"
              >
                <div className="ms-listing-card__top">
                  <span className="ms-badge">{item.category || "기타"}</span>
                  <span className="ms-status">{getStatusLabel(item.status)}</span>
                </div>

                <h3 className="ms-listing-card__title">
                  {item.title || "제목 없음"}
                </h3>

                <div className="ms-listing-card__price">
                  {formatPrice(item.price)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}