import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealRow = {
  id: string;
  listing_id?: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type ListingRow = {
  id: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  thumbnail_url?: string | null;
  status?: string | null;
};

type NotificationRow = {
  id: string;
  deal_id?: string | null;
  is_read?: boolean | null;
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

function dealStatusLabel(status?: string | null) {
  switch (status) {
    case "requested":
      return "문의 접수";
    case "in_progress":
      return "협의 중";
    case "completed":
      return "거래 완료";
    case "cancelled":
      return "취소됨";
    default:
      return "진행 중";
  }
}

function dealStatusClass(status?: string | null) {
  switch (status) {
    case "completed":
      return "is-completed";
    case "cancelled":
      return "is-cancelled";
    case "requested":
      return "is-requested";
    default:
      return "is-progress";
  }
}

function listingStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "거래가능";
    case "reserved":
      return "예약중";
    case "sold":
      return "거래종료";
    case "hidden":
      return "숨김";
    default:
      return "거래가능";
  }
}

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export default async function MobileMyDealsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/m/auth/login?next=/m/my/deals");
  }

  const { data: dealsData, error: dealsError } = await supabase
    .from("deals")
    .select("id, listing_id, buyer_id, seller_id, status, created_at")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const deals = (dealsData || []) as DealRow[];

  const listingIds = Array.from(
    new Set(deals.map((deal) => deal.listing_id).filter(Boolean))
  ) as string[];

  const dealIds = deals.map((deal) => deal.id);

  let listingsMap = new Map<string, ListingRow>();
  if (listingIds.length > 0) {
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, category, price, thumbnail_url, status")
      .in("id", listingIds);

    listingsMap = new Map(
      ((listingsData || []) as ListingRow[]).map((item) => [item.id, item])
    );
  }

  let unreadMap = new Map<string, number>();
  if (dealIds.length > 0) {
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("id, deal_id, is_read")
      .in("deal_id", dealIds)
      .eq("is_read", false);

    const notifications = (notificationsData || []) as NotificationRow[];
    unreadMap = notifications.reduce((map, item) => {
      const dealId = item.deal_id || "";
      if (!dealId) return map;
      map.set(dealId, (map.get(dealId) || 0) + 1);
      return map;
    }, new Map<string, number>());
  }

  const cards = deals.map((deal) => {
    const listing = deal.listing_id ? listingsMap.get(deal.listing_id) : undefined;
    const unreadCount = unreadMap.get(deal.id) || 0;
    const isBuyer = deal.buyer_id === user.id;

    return {
      id: deal.id,
      title: firstText(listing?.title, "연결된 자산"),
      category: firstText(listing?.category, "기타"),
      priceText: formatPrice(listing?.price),
      thumb: listing?.thumbnail_url || "",
      dealStatus: dealStatusLabel(deal.status),
      dealStatusClass: dealStatusClass(deal.status),
      listingStatus: listingStatusLabel(listing?.status),
      dateText: formatDate(deal.created_at),
      unreadCount,
      roleText: isBuyer ? "구매 문의" : "판매 응답",
    };
  });

  const kpiTotal = cards.length;
  const kpiUnread = cards.filter((item) => item.unreadCount > 0).length;
  const kpiActive = cards.filter(
    (item) => item.dealStatus !== "거래 완료" && item.dealStatus !== "취소됨"
  ).length;

  return (
    <>
      <main className="msell-m-deals-page">
        <section className="msell-m-deals-hero">
          <div className="msell-m-deals-badge">MY DEALS</div>
          <h1 className="msell-m-deals-title">내 거래</h1>
          <p className="msell-m-deals-subtitle">
            진행 중인 문의와 거래방을 모바일에서 바로 확인할 수 있습니다.
          </p>
        </section>

        <section className="msell-m-deals-kpis">
          <div className="msell-m-deals-kpi">
            <span>전체 거래</span>
            <strong>{kpiTotal}</strong>
          </div>
          <div className="msell-m-deals-kpi">
            <span>읽지 않은 방</span>
            <strong>{kpiUnread}</strong>
          </div>
          <div className="msell-m-deals-kpi">
            <span>진행 중</span>
            <strong>{kpiActive}</strong>
          </div>
        </section>

        {dealsError ? (
          <section className="msell-m-deals-error">
            거래 목록을 불러오지 못했습니다. {dealsError.message}
          </section>
        ) : null}

        {!dealsError && cards.length === 0 ? (
          <section className="msell-m-deals-empty">
            <div className="msell-m-deals-empty-card">
              <strong>아직 거래가 없습니다.</strong>
              <p>관심 있는 자산을 찾고 거래 문의를 시작해보세요.</p>
              <Link href="/m/listings" className="msell-m-deals-empty-btn">
                자산 보러가기
              </Link>
            </div>
          </section>
        ) : null}

        {cards.length > 0 ? (
          <section className="msell-m-deals-grid">
            {cards.map((item) => (
              <Link
                key={item.id}
                href={`/deal/${item.id}`}
                className="msell-m-deals-card"
              >
                <div className="msell-m-deals-card-top">
                  <div className="msell-m-deals-card-copy">
                    <div className="msell-m-deals-card-meta">
                      <span className="msell-m-deals-card-category">
                        {item.category}
                      </span>
                      <span
                        className={`msell-m-deals-card-status ${item.dealStatusClass}`}
                      >
                        {item.dealStatus}
                      </span>
                      {item.unreadCount > 0 ? (
                        <span className="msell-m-deals-card-unread">
                          새 메시지 {item.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="msell-m-deals-card-title">{item.title}</h2>

                    <div className="msell-m-deals-card-price">{item.priceText}</div>
                  </div>

                  <div className="msell-m-deals-card-thumb">
                    {item.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumb} alt={item.title} />
                    ) : (
                      <span>{item.category.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="msell-m-deals-card-info">
                  <div className="msell-m-deals-card-line">
                    <span>유형</span>
                    <strong>{item.roleText}</strong>
                  </div>
                  <div className="msell-m-deals-card-line">
                    <span>자산 상태</span>
                    <strong>{item.listingStatus}</strong>
                  </div>
                  <div className="msell-m-deals-card-line">
                    <span>생성일</span>
                    <strong>{item.dateText}</strong>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : null}
      </main>

      <style>{`
        .msell-m-deals-page {
          width: 100%;
          padding: 12px 12px 0;
          box-sizing: border-box;
        }

        .msell-m-deals-hero {
          margin-bottom: 14px;
          padding: 8px 2px 0;
        }

        .msell-m-deals-badge {
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

        .msell-m-deals-title {
          margin: 12px 0 8px;
          color: #1f140c;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .msell-m-deals-subtitle {
          margin: 0;
          color: #7e6850;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }

        .msell-m-deals-kpis {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .msell-m-deals-kpi {
          padding: 14px 12px;
          border-radius: 18px;
          border: 1px solid #e7d9c8;
          background: #fffdfa;
          box-shadow: 0 12px 26px rgba(47, 36, 23, 0.05);
          display: grid;
          gap: 8px;
        }

        .msell-m-deals-kpi span {
          color: #9b7b58;
          font-size: 11px;
          font-weight: 800;
        }

        .msell-m-deals-kpi strong {
          color: #1f140c;
          font-size: 22px;
          line-height: 1;
          font-weight: 900;
        }

        .msell-m-deals-error {
          margin-bottom: 14px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid #efc7c7;
          background: #fff5f5;
          color: #8b2e2e;
          font-size: 13px;
          font-weight: 700;
        }

        .msell-m-deals-empty-card {
          padding: 22px 18px;
          border-radius: 22px;
          border: 1px solid #e7d9c8;
          background: linear-gradient(180deg, #fffdfa 0%, #fcf8f1 100%);
          text-align: center;
          box-shadow: 0 16px 34px rgba(47, 36, 23, 0.06);
        }

        .msell-m-deals-empty-card strong {
          display: block;
          color: #1f140c;
          font-size: 16px;
          font-weight: 900;
        }

        .msell-m-deals-empty-card p {
          margin: 8px 0 16px;
          color: #7e6850;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }

        .msell-m-deals-empty-btn {
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

        .msell-m-deals-grid {
          display: grid;
          gap: 12px;
        }

        .msell-m-deals-card {
          display: grid;
          gap: 12px;
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

        .msell-m-deals-card:active {
          transform: scale(0.992);
        }

        .msell-m-deals-card-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 72px;
          gap: 12px;
          align-items: start;
        }

        .msell-m-deals-card-copy {
          min-width: 0;
        }

        .msell-m-deals-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .msell-m-deals-card-category {
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

        .msell-m-deals-card-status {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .msell-m-deals-card-status.is-requested {
          background: #fff3e6;
          color: #9c5a16;
        }

        .msell-m-deals-card-status.is-progress {
          background: #edf7ef;
          color: #256c3d;
        }

        .msell-m-deals-card-status.is-completed {
          background: #efe8ff;
          color: #5c3ea8;
        }

        .msell-m-deals-card-status.is-cancelled {
          background: #f2eee7;
          color: #8f7658;
        }

        .msell-m-deals-card-unread {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #2f2417;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
        }

        .msell-m-deals-card-title {
          margin: 0;
          color: #1f140c;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 900;
          letter-spacing: -0.02em;
          word-break: break-word;
        }

        .msell-m-deals-card-price {
          margin-top: 8px;
          color: #2f2417;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
        }

        .msell-m-deals-card-thumb {
          width: 72px;
          height: 72px;
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

        .msell-m-deals-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msell-m-deals-card-info {
          display: grid;
          gap: 8px;
          padding-top: 2px;
        }

        .msell-m-deals-card-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .msell-m-deals-card-line span {
          color: #9b7b58;
          font-size: 12px;
          font-weight: 700;
        }

        .msell-m-deals-card-line strong {
          color: #2f2417;
          font-size: 12px;
          font-weight: 900;
          text-align: right;
        }

        @media (max-width: 380px) {
          .msell-m-deals-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .msell-m-deals-title {
            font-size: 28px;
          }

          .msell-m-deals-kpis {
            grid-template-columns: 1fr;
          }

          .msell-m-deals-card {
            padding: 12px;
            border-radius: 20px;
          }

          .msell-m-deals-card-top {
            grid-template-columns: minmax(0, 1fr) 66px;
          }

          .msell-m-deals-card-thumb {
            width: 66px;
            height: 66px;
            border-radius: 16px;
          }

          .msell-m-deals-card-title {
            font-size: 15px;
          }

          .msell-m-deals-card-price {
            font-size: 17px;
          }
        }
      `}</style>
    </>
  );
}