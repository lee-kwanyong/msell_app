import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  status?: string;
  q?: string;
}>;

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
    case "draft":
      return "임시저장";
    case "pending_review":
      return "검수중";
    case "active":
      return "거래가능";
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "hidden":
      return "숨김";
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
    case "active":
      return "is-active";
    case "reserved":
      return "is-reserved";
    case "sold":
      return "is-sold";
    case "draft":
      return "is-draft";
    case "pending_review":
      return "is-review";
    case "hidden":
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

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = (await searchParams) ?? {};
  const keyword = resolved.q?.trim() || "";
  const status = resolved.status?.trim() || "all";

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my/listings");
  }

  let query = supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`
    );
  }

  const { data, error } = await query;
  const rows = (data || []) as ListingRow[];

  const cards = rows.map((row) => {
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
    };
  });

  const totalCount = cards.length;
  const activeCount = cards.filter((item) => item.status === "active").length;
  const reservedCount = cards.filter((item) => item.status === "reserved").length;
  const soldCount = cards.filter((item) => item.status === "sold").length;

  return (
    <>
      <main className="msell-my-listings-page">
        <section className="msell-my-listings-hero">
          <div className="msell-my-listings-hero-copy">
            <div className="msell-my-listings-badge">MY LISTINGS</div>
            <h1 className="msell-my-listings-title">내 자산</h1>
            <p className="msell-my-listings-subtitle">
              내가 등록한 자산을 상태별로 확인하고 수정할 수 있습니다.
            </p>
          </div>

          <div className="msell-my-listings-hero-actions">
            <Link href="/listings/create" className="msell-my-listings-primary">
              자산 등록
            </Link>
          </div>
        </section>

        <section className="msell-my-listings-kpis">
          <div className="msell-my-listings-kpi">
            <span>전체 등록</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="msell-my-listings-kpi">
            <span>거래가능</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="msell-my-listings-kpi">
            <span>예약중</span>
            <strong>{reservedCount}</strong>
          </div>
          <div className="msell-my-listings-kpi">
            <span>거래종료</span>
            <strong>{soldCount}</strong>
          </div>
        </section>

        <section className="msell-my-listings-filter">
          <form action="/my/listings" className="msell-my-listings-filter-form">
            <div className="msell-my-listings-searchbox">
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder="제목, 설명, 카테고리 검색"
                className="msell-my-listings-input"
              />
              <button type="submit" className="msell-my-listings-searchbtn">
                검색
              </button>
            </div>

            <div className="msell-my-listings-chips">
              {[
                { value: "all", label: "전체" },
                { value: "active", label: "거래가능" },
                { value: "reserved", label: "예약중" },
                { value: "sold", label: "거래종료" },
                { value: "draft", label: "임시저장" },
                { value: "hidden", label: "숨김" },
              ].map((item) => {
                const active = status === item.value;

                return (
                  <Link
                    key={item.value}
                    href={`/my/listings?status=${encodeURIComponent(item.value)}${
                      keyword ? `&q=${encodeURIComponent(keyword)}` : ""
                    }`}
                    className={`msell-my-listings-chip ${active ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </form>
        </section>

        {error ? (
          <section className="msell-my-listings-alert is-error">
            자산 목록을 불러오지 못했습니다. {error.message}
          </section>
        ) : null}

        {!error && cards.length === 0 ? (
          <section className="msell-my-listings-empty">
            <div className="msell-my-listings-empty-card">
              <strong>등록된 자산이 없습니다.</strong>
              <p>새 자산을 등록하면 여기서 상태와 내용을 관리할 수 있습니다.</p>
              <Link
                href="/listings/create"
                className="msell-my-listings-empty-btn"
              >
                자산 등록
              </Link>
            </div>
          </section>
        ) : null}

        {cards.length > 0 ? (
          <section className="msell-my-listings-grid">
            {cards.map((item) => (
              <article key={item.id} className="msell-my-listings-card">
                <Link
                  href={`/listings/${item.id}`}
                  className="msell-my-listings-card-main"
                >
                  <div className="msell-my-listings-card-top">
                    <div className="msell-my-listings-card-copy">
                      <div className="msell-my-listings-card-meta">
                        <span className="msell-my-listings-card-category">
                          {item.category}
                        </span>
                        <span
                          className={`msell-my-listings-card-status ${statusClassName(
                            item.status
                          )}`}
                        >
                          {item.statusText}
                        </span>
                      </div>

                      <h2 className="msell-my-listings-card-title">{item.title}</h2>
                      <div className="msell-my-listings-card-price">{item.priceText}</div>
                    </div>

                    <div className="msell-my-listings-card-thumb">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnailUrl} alt={item.title} />
                      ) : (
                        <span>{item.category.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  {item.transferMethod ? (
                    <div className="msell-my-listings-card-transfer">
                      이전 방식 · {item.transferMethod}
                    </div>
                  ) : null}

                  {item.summary ? (
                    <p className="msell-my-listings-card-summary">{item.summary}</p>
                  ) : null}

                  <div className="msell-my-listings-card-bottom">
                    <span>{item.dateText}</span>
                  </div>
                </Link>

                <div className="msell-my-listings-card-actions">
                  <Link
                    href={`/listings/${item.id}`}
                    className="msell-my-listings-secondary"
                  >
                    상세보기
                  </Link>
                  <Link
                    href={`/listings/${item.id}/edit`}
                    className="msell-my-listings-primary-sm"
                  >
                    수정
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>

      <style>{`
        .msell-my-listings-page {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px 24px 40px;
          box-sizing: border-box;
        }

        .msell-my-listings-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .msell-my-listings-badge {
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

        .msell-my-listings-title {
          margin: 14px 0 8px;
          color: #1f140c;
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-my-listings-subtitle {
          margin: 0;
          color: #7e6850;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 600;
        }

        .msell-my-listings-primary {
          min-width: 132px;
          height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.18);
        }

        .msell-my-listings-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .msell-my-listings-kpi {
          padding: 16px 16px;
          border-radius: 20px;
          border: 1px solid #e7d9c8;
          background: #fffdfa;
          box-shadow: 0 12px 24px rgba(47, 36, 23, 0.05);
          display: grid;
          gap: 10px;
        }

        .msell-my-listings-kpi span {
          color: #9b7b58;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-my-listings-kpi strong {
          color: #1f140c;
          font-size: 28px;
          line-height: 1;
          font-weight: 900;
        }

        .msell-my-listings-filter {
          margin-bottom: 18px;
          padding: 16px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-my-listings-filter-form {
          display: grid;
          gap: 12px;
        }

        .msell-my-listings-searchbox {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .msell-my-listings-input {
          width: 100%;
          height: 50px;
          border-radius: 16px;
          border: 1px solid #e5ddd2;
          background: #ffffff;
          padding: 0 16px;
          color: #2b1d12;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .msell-my-listings-input:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
        }

        .msell-my-listings-searchbtn {
          height: 50px;
          padding: 0 18px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .msell-my-listings-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .msell-my-listings-chip {
          height: 38px;
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

        .msell-my-listings-chip.is-active {
          background: #2f2417;
          border-color: #2f2417;
          color: #ffffff;
        }

        .msell-my-listings-alert {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-my-listings-alert.is-error {
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
        }

        .msell-my-listings-empty-card {
          padding: 34px 24px;
          border-radius: 24px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          text-align: center;
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-my-listings-empty-card strong {
          display: block;
          color: #1f140c;
          font-size: 20px;
          font-weight: 900;
        }

        .msell-my-listings-empty-card p {
          margin: 10px 0 18px;
          color: #7e6850;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 600;
        }

        .msell-my-listings-empty-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 132px;
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .msell-my-listings-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .msell-my-listings-card {
          border-radius: 24px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .msell-my-listings-card-main {
          display: grid;
          gap: 12px;
          padding: 16px;
          text-decoration: none;
        }

        .msell-my-listings-card-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 96px;
          gap: 14px;
          align-items: start;
        }

        .msell-my-listings-card-copy {
          min-width: 0;
        }

        .msell-my-listings-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .msell-my-listings-card-category {
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

        .msell-my-listings-card-status {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .msell-my-listings-card-status.is-active {
          background: #edf7ef;
          color: #256c3d;
        }

        .msell-my-listings-card-status.is-reserved {
          background: #fff3e6;
          color: #9c5a16;
        }

        .msell-my-listings-card-status.is-sold {
          background: #efe8ff;
          color: #5c3ea8;
        }

        .msell-my-listings-card-status.is-draft {
          background: #eef3ff;
          color: #3a5da8;
        }

        .msell-my-listings-card-status.is-review {
          background: #fff7df;
          color: #9a6b00;
        }

        .msell-my-listings-card-status.is-muted {
          background: #f2eee7;
          color: #8f7658;
        }

        .msell-my-listings-card-title {
          margin: 0;
          color: #1f140c;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 900;
          letter-spacing: -0.02em;
          word-break: break-word;
        }

        .msell-my-listings-card-price {
          margin-top: 8px;
          color: #2f2417;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
        }

        .msell-my-listings-card-thumb {
          width: 96px;
          height: 96px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eadfce;
          background: #f7f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8f7658;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .msell-my-listings-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msell-my-listings-card-transfer {
          color: #7e6850;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 700;
        }

        .msell-my-listings-card-summary {
          margin: 0;
          color: #6f5a45;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .msell-my-listings-card-bottom {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          color: #9a8267;
          font-size: 12px;
          font-weight: 800;
        }

        .msell-my-listings-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 0 16px 16px;
        }

        .msell-my-listings-secondary,
        .msell-my-listings-primary-sm {
          height: 44px;
          border-radius: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          box-sizing: border-box;
        }

        .msell-my-listings-secondary {
          border: 1px solid #dfd0bb;
          background: #fffdfa;
          color: #2f2417;
        }

        .msell-my-listings-primary-sm {
          border: none;
          background: linear-gradient(180deg, #2f1d10 0%, #23140a 100%);
          color: #ffffff;
        }

        @media (max-width: 1180px) {
          .msell-my-listings-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .msell-my-listings-page {
            padding: 14px 12px 20px;
          }

          .msell-my-listings-hero {
            flex-direction: column;
            align-items: stretch;
          }

          .msell-my-listings-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .msell-my-listings-filter {
            padding: 14px;
            border-radius: 20px;
          }

          .msell-my-listings-searchbox {
            grid-template-columns: 1fr;
          }

          .msell-my-listings-grid {
            grid-template-columns: 1fr;
          }

          .msell-my-listings-card-top {
            grid-template-columns: minmax(0, 1fr) 84px;
          }

          .msell-my-listings-card-thumb {
            width: 84px;
            height: 84px;
            border-radius: 18px;
          }
        }

        @media (max-width: 380px) {
          .msell-my-listings-kpis {
            grid-template-columns: 1fr;
          }

          .msell-my-listings-title {
            font-size: 30px;
          }

          .msell-my-listings-card-main,
          .msell-my-listings-card-actions,
          .msell-my-listings-filter {
            padding-left: 12px;
            padding-right: 12px;
          }

          .msell-my-listings-card-top {
            grid-template-columns: minmax(0, 1fr) 74px;
          }

          .msell-my-listings-card-thumb {
            width: 74px;
            height: 74px;
            border-radius: 16px;
          }

          .msell-my-listings-card-title {
            font-size: 16px;
          }

          .msell-my-listings-card-price {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}