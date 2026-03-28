import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

type ListingRow = {
  id: string;
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

export default async function MobileListingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = (await searchParams) ?? {};
  const keyword = resolved.q?.trim() || "";
  const status = resolved.status?.trim() || "active";

  const supabase = await supabaseServer();

  let query = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`
    );
  }

  const { data, error } = await query;

  const rows = (data || []) as ListingRow[];
  const listings = rows
    .filter((row) => row?.id)
    .map((row) => {
      const transferMethod = extractTransferMethod(row.description);
      const summary = cleanDescription(row.description);

      return {
        id: row.id,
        title: firstText(row.title, "제목 없음"),
        category: firstText(row.category, "기타"),
        priceText: formatPrice(row.price),
        status: row.status || "active",
        statusText: statusLabel(row.status),
        dateText: formatDate(row.created_at),
        thumbnailUrl: row.thumbnail_url || "",
        summary: summary || "",
        transferMethod: transferMethod || "",
        seller: firstText(row.seller_name, row.username, "판매자"),
      };
    });

  return (
    <>
      <main className="msell-m-listings-page">
        <section className="msell-m-listings-hero">
          <div className="msell-m-listings-badge">MOBILE MARKET</div>
          <h1 className="msell-m-listings-title">자산목록</h1>
          <p className="msell-m-listings-subtitle">
            모바일에서 빠르게 둘러보고 바로 문의할 수 있게 정리했습니다.
          </p>
        </section>

        <section className="msell-m-listings-panel">
          <form className="msell-m-listings-search" action="/m/listings">
            <div className="msell-m-listings-searchbox">
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder="제목, 설명, 카테고리 검색"
                className="msell-m-listings-input"
              />
              <button type="submit" className="msell-m-listings-searchbtn">
                검색
              </button>
            </div>

            <div className="msell-m-listings-status">
              {[
                { value: "active", label: "거래가능" },
                { value: "reserved", label: "예약중" },
                { value: "sold", label: "거래종료" },
                { value: "all", label: "전체" },
              ].map((item) => {
                const active = status === item.value;

                return (
                  <Link
                    key={item.value}
                    href={`/m/listings?status=${encodeURIComponent(item.value)}${
                      keyword ? `&q=${encodeURIComponent(keyword)}` : ""
                    }`}
                    className={`msell-m-listings-chip ${active ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </form>
        </section>

        {error ? (
          <section className="msell-m-listings-error">
            목록을 불러오지 못했습니다. {error.message}
          </section>
        ) : null}

        {!error && listings.length === 0 ? (
          <section className="msell-m-listings-empty">
            <div className="msell-m-listings-empty-card">
              <strong>표시할 자산이 없습니다.</strong>
              <p>검색어나 상태를 바꾸거나 새 자산을 등록해보세요.</p>
              <Link href="/m/listings/create" className="msell-m-listings-empty-btn">
                자산 등록
              </Link>
            </div>
          </section>
        ) : null}

        {listings.length > 0 ? (
          <section className="msell-m-listings-grid">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/m/listings/${item.id}`}
                className="msell-m-listings-card"
              >
                <div className="msell-m-listings-card-top">
                  <div className="msell-m-listings-card-copy">
                    <div className="msell-m-listings-card-meta">
                      <span className="msell-m-listings-card-category">
                        {item.category}
                      </span>
                      <span
                        className={`msell-m-listings-card-status ${statusClassName(item.status)}`}
                      >
                        {item.statusText}
                      </span>
                    </div>

                    <h2 className="msell-m-listings-card-title">{item.title}</h2>

                    <div className="msell-m-listings-card-price">{item.priceText}</div>
                  </div>

                  <div className="msell-m-listings-card-thumb">
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnailUrl} alt={item.title} />
                    ) : (
                      <span>{item.category.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {item.transferMethod ? (
                  <div className="msell-m-listings-card-transfer">
                    이전 방식 · {item.transferMethod}
                  </div>
                ) : null}

                {item.summary ? (
                  <p className="msell-m-listings-card-summary">{item.summary}</p>
                ) : null}

                <div className="msell-m-listings-card-bottom">
                  <span>{item.seller}</span>
                  <span>{item.dateText}</span>
                </div>
              </Link>
            ))}
          </section>
        ) : null}
      </main>

      <style>{`
        .msell-m-listings-page {
          width: 100%;
          padding: 12px 12px 0;
          box-sizing: border-box;
        }

        .msell-m-listings-hero {
          margin-bottom: 14px;
          padding: 8px 2px 0;
        }

        .msell-m-listings-badge {
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

        .msell-m-listings-title {
          margin: 12px 0 8px;
          color: #1f140c;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-m-listings-subtitle {
          margin: 0;
          color: #7e6850;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }

        .msell-m-listings-panel {
          margin-bottom: 14px;
        }

        .msell-m-listings-search {
          display: grid;
          gap: 10px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-m-listings-searchbox {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .msell-m-listings-input {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          border: 1px solid #e5ddd2;
          background: #ffffff;
          padding: 0 14px;
          color: #2b1d12;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .msell-m-listings-input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
        }

        .msell-m-listings-searchbtn {
          height: 48px;
          padding: 0 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .msell-m-listings-status {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .msell-m-listings-status::-webkit-scrollbar {
          display: none;
        }

        .msell-m-listings-chip {
          flex: 0 0 auto;
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #dfd0bb;
          background: #fffdfa;
          color: #7e6850;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .msell-m-listings-chip.is-active {
          background: #2f2417;
          border-color: #2f2417;
          color: #ffffff;
        }

        .msell-m-listings-error {
          margin-bottom: 14px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-m-listings-empty {
          padding-top: 6px;
        }

        .msell-m-listings-empty-card {
          padding: 22px 18px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          text-align: center;
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-m-listings-empty-card strong {
          display: block;
          color: #1f140c;
          font-size: 16px;
          font-weight: 900;
        }

        .msell-m-listings-empty-card p {
          margin: 8px 0 16px;
          color: #7e6850;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }

        .msell-m-listings-empty-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 124px;
          height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
        }

        .msell-m-listings-grid {
          display: grid;
          gap: 12px;
        }

        .msell-m-listings-card {
          display: grid;
          gap: 10px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          text-decoration: none;
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            border-color 0.16s ease;
        }

        .msell-m-listings-card:active {
          transform: scale(0.992);
        }

        .msell-m-listings-card-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 76px;
          gap: 12px;
          align-items: start;
        }

        .msell-m-listings-card-copy {
          min-width: 0;
        }

        .msell-m-listings-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .msell-m-listings-card-category {
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

        .msell-m-listings-card-status {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .msell-m-listings-card-status.is-active {
          background: #edf7ef;
          color: #256c3d;
        }

        .msell-m-listings-card-status.is-reserved {
          background: #fff3e6;
          color: #9c5a16;
        }

        .msell-m-listings-card-status.is-sold {
          background: #efe8ff;
          color: #5c3ea8;
        }

        .msell-m-listings-card-status.is-muted {
          background: #f2eee7;
          color: #8f7658;
        }

        .msell-m-listings-card-title {
          margin: 0;
          color: #1f140c;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 900;
          letter-spacing: -0.02em;
          word-break: break-word;
        }

        .msell-m-listings-card-price {
          margin-top: 8px;
          color: #2f2417;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
        }

        .msell-m-listings-card-thumb {
          width: 76px;
          height: 76px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #eadfce;
          background: #f7f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8f7658;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .msell-m-listings-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msell-m-listings-card-transfer {
          color: #7e6850;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 700;
        }

        .msell-m-listings-card-summary {
          margin: 0;
          color: #6f5a45;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .msell-m-listings-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #9a8267;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 380px) {
          .msell-m-listings-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .msell-m-listings-title {
            font-size: 28px;
          }

          .msell-m-listings-search {
            padding: 12px;
            border-radius: 20px;
          }

          .msell-m-listings-searchbox {
            grid-template-columns: 1fr;
          }

          .msell-m-listings-searchbtn,
          .msell-m-listings-input {
            height: 46px;
            font-size: 13px;
          }

          .msell-m-listings-card {
            padding: 12px;
            border-radius: 20px;
          }

          .msell-m-listings-card-top {
            grid-template-columns: minmax(0, 1fr) 68px;
          }

          .msell-m-listings-card-thumb {
            width: 68px;
            height: 68px;
            border-radius: 16px;
          }

          .msell-m-listings-card-title {
            font-size: 15px;
          }

          .msell-m-listings-card-price {
            font-size: 17px;
          }
        }
      `}</style>
    </>
  );
}