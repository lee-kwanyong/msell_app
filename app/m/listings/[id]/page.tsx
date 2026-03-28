import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ListingRow = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
  seller_name?: string | null;
  username?: string | null;
};

function formatPrice(value: unknown) {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(num)) return "가격 협의";
  return `${new Intl.NumberFormat("ko-KR").format(num)}원`;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function statusLabel(status?: string | null) {
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
      return "검수중";
    case "rejected":
      return "반려";
    case "archived":
      return "보관";
    default:
      return "거래가능";
  }
}

function statusClassName(status?: string | null) {
  switch (status) {
    case "reserved":
      return "is-reserved";
    case "sold":
      return "is-sold";
    case "hidden":
    case "draft":
    case "pending_review":
    case "rejected":
    case "archived":
      return "is-muted";
    default:
      return "is-active";
  }
}

function extractTransferMethod(description?: string | null) {
  if (!description) return "";
  const match = description.match(/\[이전 방식\]\s*(.*)/);
  return match?.[1]?.trim() || "";
}

function cleanDescription(description?: string | null) {
  if (!description) return "";
  return description.replace(/\[이전 방식\]\s*.*$/m, "").trim();
}

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export default async function MobileListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    notFound();
  }

  const listing = data as ListingRow | null;

  if (!listing?.id) {
    notFound();
  }

  const isOwner = !!user?.id && !!listing.user_id && user.id === listing.user_id;
  const transferMethod = extractTransferMethod(listing.description);
  const cleanBody = cleanDescription(listing.description);
  const seller = firstText(listing.seller_name, listing.username, "판매자");
  const canInquire = listing.status === "active" || listing.status === "reserved";

  return (
    <>
      <main className="msell-m-detail-page">
        <section className="msell-m-detail-topbar">
          <Link href="/m/listings" className="msell-m-detail-back">
            목록으로
          </Link>

          {isOwner ? (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="msell-m-detail-edit"
            >
              수정
            </Link>
          ) : null}
        </section>

        <section className="msell-m-detail-hero">
          <div className="msell-m-detail-thumb">
            {listing.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.thumbnail_url} alt={listing.title || "listing"} />
            ) : (
              <span>{firstText(listing.category, "기타").slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="msell-m-detail-header">
            <div className="msell-m-detail-meta">
              <span className="msell-m-detail-category">
                {firstText(listing.category, "기타")}
              </span>
              <span
                className={`msell-m-detail-status ${statusClassName(listing.status)}`}
              >
                {statusLabel(listing.status)}
              </span>
            </div>

            <h1 className="msell-m-detail-title">
              {firstText(listing.title, "제목 없음")}
            </h1>

            <div className="msell-m-detail-price">{formatPrice(listing.price)}</div>

            <div className="msell-m-detail-subinfo">
              <span>{seller}</span>
              <span>{formatDate(listing.created_at)}</span>
            </div>
          </div>
        </section>

        <section className="msell-m-detail-summary">
          <div className="msell-m-detail-summary-card">
            <span>카테고리</span>
            <strong>{firstText(listing.category, "기타")}</strong>
          </div>
          <div className="msell-m-detail-summary-card">
            <span>상태</span>
            <strong>{statusLabel(listing.status)}</strong>
          </div>
          <div className="msell-m-detail-summary-card">
            <span>희망 가격</span>
            <strong>{formatPrice(listing.price)}</strong>
          </div>
        </section>

        {transferMethod ? (
          <section className="msell-m-detail-section">
            <div className="msell-m-detail-section-label">이전 방식</div>
            <div className="msell-m-detail-transfer">{transferMethod}</div>
          </section>
        ) : null}

        <section className="msell-m-detail-section">
          <div className="msell-m-detail-section-label">설명</div>
          <div className="msell-m-detail-body">
            {cleanBody ? (
              cleanBody.split("\n").map((line, index) => (
                <p key={`${listing.id}-${index}`}>{line || "\u00A0"}</p>
              ))
            ) : (
              <p>등록된 설명이 없습니다.</p>
            )}
          </div>
        </section>

        <section className="msell-m-detail-bottom">
          {isOwner ? (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="msell-m-detail-primary"
            >
              자산 수정
            </Link>
          ) : canInquire ? (
            <form action="/api/deals/create" method="post" className="msell-m-detail-form">
              <input type="hidden" name="listing_id" value={listing.id} />
              <input type="hidden" name="return_to" value={`/m/listings/${listing.id}`} />
              <button type="submit" className="msell-m-detail-primary">
                거래 문의 시작
              </button>
            </form>
          ) : (
            <button type="button" className="msell-m-detail-disabled" disabled>
              현재 문의 불가
            </button>
          )}

          <Link href="/m/listings" className="msell-m-detail-secondary">
            다른 자산 보기
          </Link>
        </section>
      </main>

      <style>{`
        .msell-m-detail-page {
          width: 100%;
          padding: 12px 12px 0;
          box-sizing: border-box;
          display: grid;
          gap: 14px;
        }

        .msell-m-detail-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .msell-m-detail-back,
        .msell-m-detail-edit {
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

        .msell-m-detail-hero {
          display: grid;
          gap: 14px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-m-detail-thumb {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid #eadfce;
          background: #f7f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8f7658;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .msell-m-detail-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msell-m-detail-header {
          min-width: 0;
        }

        .msell-m-detail-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .msell-m-detail-category {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #f1e6d6;
          color: #8f7658;
          font-size: 11px;
          font-weight: 800;
        }

        .msell-m-detail-status {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .msell-m-detail-status.is-active {
          background: #edf7ef;
          color: #256c3d;
        }

        .msell-m-detail-status.is-reserved {
          background: #fff3e6;
          color: #9c5a16;
        }

        .msell-m-detail-status.is-sold {
          background: #efe8ff;
          color: #5c3ea8;
        }

        .msell-m-detail-status.is-muted {
          background: #f2eee7;
          color: #8f7658;
        }

        .msell-m-detail-title {
          margin: 0;
          color: #1f140c;
          font-size: 24px;
          line-height: 1.35;
          letter-spacing: -0.03em;
          font-weight: 900;
          word-break: break-word;
        }

        .msell-m-detail-price {
          margin-top: 10px;
          color: #2f2417;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 900;
        }

        .msell-m-detail-subinfo {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #8f7658;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-m-detail-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .msell-m-detail-summary-card {
          padding: 14px 12px;
          border-radius: 18px;
          border: 1px solid #e7d9c8;
          background: #fffdfa;
          display: grid;
          gap: 8px;
          min-width: 0;
        }

        .msell-m-detail-summary-card span {
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
        }

        .msell-m-detail-summary-card strong {
          color: #1f140c;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 900;
          word-break: break-word;
        }

        .msell-m-detail-section {
          display: grid;
          gap: 10px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.05);
        }

        .msell-m-detail-section-label {
          color: #9b7b58;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .msell-m-detail-transfer {
          color: #2f2417;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 800;
        }

        .msell-m-detail-body {
          display: grid;
          gap: 10px;
          color: #5e4b38;
          font-size: 14px;
          line-height: 1.75;
          font-weight: 600;
        }

        .msell-m-detail-body p {
          margin: 0;
          word-break: break-word;
        }

        .msell-m-detail-bottom {
          display: grid;
          gap: 10px;
        }

        .msell-m-detail-form {
          width: 100%;
        }

        .msell-m-detail-primary,
        .msell-m-detail-secondary,
        .msell-m-detail-disabled {
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

        .msell-m-detail-primary {
          border: none;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.18);
          cursor: pointer;
        }

        .msell-m-detail-secondary {
          border: 1px solid #dfd0bb;
          background: #eadfcf;
          color: #2f2417;
        }

        .msell-m-detail-disabled {
          border: 1px solid #e5ddd2;
          background: #f2eee7;
          color: #9b7b58;
          cursor: not-allowed;
        }

        @media (max-width: 380px) {
          .msell-m-detail-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .msell-m-detail-hero,
          .msell-m-detail-section {
            padding: 12px;
            border-radius: 20px;
          }

          .msell-m-detail-thumb {
            border-radius: 18px;
          }

          .msell-m-detail-title {
            font-size: 22px;
          }

          .msell-m-detail-price {
            font-size: 22px;
          }

          .msell-m-detail-summary {
            grid-template-columns: 1fr;
          }

          .msell-m-detail-primary,
          .msell-m-detail-secondary,
          .msell-m-detail-disabled {
            height: 50px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}