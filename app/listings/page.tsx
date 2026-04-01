import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  category?: string;
}>;

type ListingRow = {
  id: string;
  title: string | null;
  description?: string | null;
  listing_type?: string | null;
  category?: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  view_count?: number | null;
  inquiry_count?: number | null;
  price_negotiable?: boolean | null;
};

type CategoryFilter = {
  key: string;
  label: string;
  aliases: string[];
};

const CATEGORY_FILTERS: CategoryFilter[] = [
  { key: "all", label: "전체보기", aliases: [] },
  {
    key: "youtube",
    label: "유튜브",
    aliases: ["youtube", "youtube_channel", "YouTube Channel"],
  },
  {
    key: "youtube_shorts",
    label: "유튜브쇼츠",
    aliases: ["youtube_shorts", "YouTube Shorts", "유튜브쇼츠"],
  },
  {
    key: "instagram",
    label: "인스타",
    aliases: ["instagram", "instagram_account", "Instagram Account"],
  },
  {
    key: "tiktok",
    label: "틱톡",
    aliases: ["tiktok", "tiktok_account", "TikTok Account"],
  },
  {
    key: "domain",
    label: "도메인",
    aliases: ["domain", "Domain"],
  },
  {
    key: "website",
    label: "웹사이트",
    aliases: ["website", "website_blog", "Website / Blog"],
  },
  {
    key: "newsletter",
    label: "뉴스레터",
    aliases: [
      "newsletter",
      "newsletter_community",
      "Newsletter / Community",
    ],
  },
  {
    key: "saas",
    label: "SaaS",
    aliases: ["saas", "saas_app", "SaaS / App"],
  },
  {
    key: "marketing_asset",
    label: "마케팅자산",
    aliases: ["marketing_asset", "Marketing Asset"],
  },
];

function normalizeValue(value?: string | null) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}. ${mm}. ${dd}.`;
}

function categoryMeta(rawType?: string | null) {
  const value = String(rawType || "").trim();

  switch (value) {
    case "youtube_channel":
    case "YouTube Channel":
      return { short: "YT", bg: "#fff1f2", color: "#b91c1c", label: "유튜브" };

    case "youtube_shorts":
    case "YouTube Shorts":
    case "유튜브쇼츠":
      return { short: "YS", bg: "#fff7ed", color: "#c2410c", label: "유튜브쇼츠" };

    case "instagram_account":
    case "Instagram Account":
      return { short: "IG", bg: "#fdf0f7", color: "#b83b7c", label: "인스타" };

    case "tiktok_account":
    case "TikTok Account":
      return { short: "TT", bg: "#eefcff", color: "#0f766e", label: "틱톡" };

    case "website_blog":
    case "Website / Blog":
      return { short: "WB", bg: "#eff6ff", color: "#1d4ed8", label: "웹사이트" };

    case "store_commerce":
    case "Store / Commerce":
      return { short: "SC", bg: "#fefce8", color: "#a16207", label: "커머스" };

    case "saas_app":
    case "SaaS / App":
      return { short: "SA", bg: "#ecfdf5", color: "#15803d", label: "SaaS" };

    case "domain":
    case "Domain":
      return { short: "DM", bg: "#f3f4f6", color: "#111827", label: "도메인" };

    case "newsletter_community":
    case "Newsletter / Community":
      return { short: "NC", bg: "#fff7ed", color: "#c2410c", label: "뉴스레터" };

    case "course_digital_content":
    case "Course / Digital Content":
      return { short: "CD", bg: "#eef2ff", color: "#3730a3", label: "디지털콘텐츠" };

    case "marketing_asset":
    case "Marketing Asset":
      return { short: "MA", bg: "#ecfccb", color: "#4d7c0f", label: "마케팅자산" };

    default:
      return { short: "ETC", bg: "#f4ede3", color: "#6b4e33", label: value || "기타" };
  }
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "active":
      return "거래가능";
    default:
      return "";
  }
}

function resolveCategoryValue(item: ListingRow) {
  const category = String(item.category || "").trim();
  const listingType = String(item.listing_type || "").trim();

  const genericListingTypes = new Set(["sell", "buy", "wanted", "wtb", "wts"]);

  if (category) return category;
  if (listingType && !genericListingTypes.has(listingType.toLowerCase())) {
    return listingType;
  }

  return "기타";
}

function matchesCategory(item: ListingRow, selectedCategory: string) {
  if (selectedCategory === "all") return true;

  const filter = CATEGORY_FILTERS.find((entry) => entry.key === selectedCategory);
  if (!filter) return true;

  const value = normalizeValue(resolveCategoryValue(item));
  return filter.aliases.some((alias) => normalizeValue(alias) === value);
}

function getFilterCount(listings: ListingRow[], filterKey: string) {
  return listings.filter((item) => matchesCategory(item, filterKey)).length;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const selectedCategory = CATEGORY_FILTERS.some(
    (item) => item.key === resolved.category
  )
    ? (resolved.category as string)
    : "all";

  const supabase = await supabaseServer();
  const PUBLIC_STATUSES = ["active", "reserved"];

  const { data } = await supabase
    .from("listings")
    .select("*")
    .in("status", PUBLIC_STATUSES)
    .order("created_at", { ascending: false });

  const allListings: ListingRow[] = Array.isArray(data) ? (data as ListingRow[]) : [];
  const filteredListings = allListings.filter((item) =>
    matchesCategory(item, selectedCategory)
  );

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "22px 24px 80px",
      }}
    >
      <style>{`
        .listings-header-card {
          border: 1px solid #e3d4c1;
          background: #fcfaf6;
          border-radius: 28px;
          padding: 18px 18px 20px;
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .listings-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .listings-badge {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          background: #f1e6d6;
          color: #9a7a57;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .listings-title {
          margin: 14px 0 10px;
          color: #1f140c;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .listings-subtitle {
          margin: 0;
          color: #8f7658;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 700;
        }

        .listings-create-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 14px;
          background: #2f1d10;
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.16);
          white-space: nowrap;
        }

        .listings-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .listings-filter-chip {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #ddd0bd;
          background: #fffdfa;
          color: #6e5a47;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
        }

        .listings-filter-chip:hover {
          transform: translateY(-1px);
          background: #ffffff;
        }

        .listings-filter-chip.is-active {
          background: #2f1d10;
          border-color: #2f1d10;
          color: #fff;
          box-shadow: 0 10px 20px rgba(47, 36, 23, 0.12);
        }

        .listings-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          background: rgba(255,255,255,0.6);
          color: inherit;
          font-size: 11px;
          font-weight: 900;
          padding: 0 6px;
          box-sizing: border-box;
        }

        .listings-filter-chip.is-active .listings-filter-count {
          background: rgba(255,255,255,0.18);
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .listings-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          height: 100%;
        }

        .listings-card {
          height: 100%;
          min-height: 228px;
          border: 1px solid #e3d4c1;
          background: #fcfaf6;
          border-radius: 24px;
          padding: 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 24px rgba(47, 36, 23, 0.04);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .listings-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 32px rgba(47, 36, 23, 0.08);
        }

        .listings-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .listings-card-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .listings-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          line-height: 1;
        }

        .listings-pill-status {
          background: #eaf8ef;
          color: #15803d;
          border: 1px solid #cfead7;
        }

        .listings-pill-meta {
          background: #f3ede5;
          color: #7a6550;
          border: 1px solid #e2d6c7;
        }

        .listings-title-wrap {
          margin-top: 14px;
          min-height: 64px;
        }

        .listings-card-title {
          margin: 0;
          color: #140d07;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .listings-price-box {
          margin-top: 14px;
          border: 1px solid #e5d9cb;
          border-radius: 16px;
          background: #f7f2ea;
          padding: 12px;
        }

        .listings-price-label {
          color: #9a7a57;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .listings-price-value {
          color: #140d07;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .listings-description {
          margin-top: 12px;
          color: #7d664f;
          font-size: 11px;
          line-height: 1.55;
          font-weight: 700;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 52px;
        }

        .listings-bottom {
          margin-top: auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding-top: 12px;
        }

        .listings-stat {
          border: 1px solid #e8ddd0;
          border-radius: 14px;
          background: #f7f2ea;
          padding: 10px 8px;
          text-align: center;
        }

        .listings-stat-label {
          color: #9a7a57;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .listings-stat-value {
          color: #1f140c;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
        }

        .listings-empty {
          margin-top: 18px;
          border: 1px dashed #dccdb8;
          background: #fcfaf6;
          border-radius: 24px;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          color: #7a6550;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.7;
        }

        @media (max-width: 1180px) {
          .listings-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .listings-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .listings-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .listings-top-row {
            flex-direction: column;
            align-items: stretch;
          }

          .listings-create-btn {
            width: 100%;
          }
        }

        @media (max-width: 540px) {
          .listings-grid {
            grid-template-columns: 1fr;
          }

          main {
            padding: 16px 12px 110px !important;
          }

          .listings-header-card {
            border-radius: 24px;
            padding: 16px;
          }

          .listings-title {
            font-size: 20px;
          }
        }
      `}</style>

      <section className="listings-header-card">
        <div className="listings-top-row">
          <div>
            <div className="listings-badge">자산 마켓</div>
            <h1 className="listings-title">거래 가능한 디지털 자산 목록</h1>
            <p className="listings-subtitle">
              카테고리, 가격, 상태를 한눈에 보고 빠르게 문의를 시작할 수 있도록 정리했다.
            </p>
          </div>

          <Link href="/listings/create" className="listings-create-btn">
            자산 등록하기
          </Link>
        </div>

        <div className="listings-filter-row">
          {CATEGORY_FILTERS.map((filter) => {
            const href =
              filter.key === "all"
                ? "/listings"
                : `/listings?category=${encodeURIComponent(filter.key)}`;

            const count = getFilterCount(allListings, filter.key);
            const isActive = selectedCategory === filter.key;

            return (
              <Link
                key={filter.key}
                href={href}
                className={`listings-filter-chip${isActive ? " is-active" : ""}`}
              >
                <span>{filter.label}</span>
                <span className="listings-filter-count">{count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {filteredListings.length === 0 ? (
        <div className="listings-empty">
          선택한 카테고리에 해당하는 거래 가능한 자산이 아직 없습니다.
        </div>
      ) : (
        <section className="listings-grid">
          {filteredListings.map((item) => {
            const meta = categoryMeta(resolveCategoryValue(item));
            const status = statusLabel(item.status);

            return (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="listings-card-link"
              >
                <article className="listings-card">
                  <div className="listings-card-top">
                    <div className="listings-card-tags">
                      <span
                        className="listings-pill listings-pill-meta"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          borderColor: `${meta.color}22`,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {status ? (
                      <span className="listings-pill listings-pill-status">
                        {status}
                      </span>
                    ) : null}
                  </div>

                  <div className="listings-title-wrap">
                    <h3 className="listings-card-title">
                      {item.title || "제목 없음"}
                    </h3>
                  </div>

                  <div className="listings-price-box">
                    <div className="listings-price-label">희망 가격</div>
                    <div className="listings-price-value">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="listings-description">
                    {item.description || "등록된 설명이 없습니다."}
                  </div>

                  <div className="listings-bottom">
                    <div className="listings-stat">
                      <div className="listings-stat-label">조회</div>
                      <div className="listings-stat-value">
                        {item.view_count ?? 0}
                      </div>
                    </div>

                    <div className="listings-stat">
                      <div className="listings-stat-label">문의</div>
                      <div className="listings-stat-value">
                        {item.inquiry_count ?? 0}
                      </div>
                    </div>

                    <div className="listings-stat">
                      <div className="listings-stat-label">등록</div>
                      <div className="listings-stat-value">
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}