import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

type DealRow = {
  id: string;
  listing_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  status: string | null;
  created_at: string | null;
};

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  user_id: string | null;
};

type DealMessageRow = {
  id: string;
  deal_id: string;
  sender_id: string | null;
  message: string | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));

  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat("ko-KR").format(numeric) + "원";
}

function statusLabel(status: string | null) {
  switch (status) {
    case "inquiry":
      return "문의중";
    case "negotiating":
      return "협의중";
    case "agreed":
      return "협의완료";
    case "closed":
      return "종료";
    case "cancelled":
      return "취소";
    default:
      return status || "-";
  }
}

function listingStatusLabel(status: string | null) {
  switch (status) {
    case "draft":
      return "임시저장";
    case "pending_review":
      return "검수대기";
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
      return status || "-";
  }
}

function displayName(profile: ProfileRow | null | undefined, fallback: string) {
  if (!profile) return fallback;
  return profile.full_name || profile.username || fallback;
}

export default async function DealDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/deal/${id}`)}`);
  }

  const { data: dealRaw, error: dealError } = await supabase
    .from("deals")
    .select("id, listing_id, buyer_id, seller_id, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (dealError || !dealRaw) {
    redirect("/my/deals");
  }

  const deal = dealRaw as DealRow;
  const isParticipant =
    deal.buyer_id === user.id || deal.seller_id === user.id;

  if (!isParticipant) {
    redirect("/my/deals");
  }

  const [{ data: listingRaw }, { data: messagesRaw }, { data: profilesRaw }] =
    await Promise.all([
      deal.listing_id
        ? supabase
            .from("listings")
            .select("id, title, category, price, status, user_id")
            .eq("id", deal.listing_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("deal_messages")
        .select("id, deal_id, sender_id, message, created_at")
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, username")
        .in(
          "id",
          [deal.buyer_id, deal.seller_id].filter(Boolean) as string[]
        ),
    ]);

  const listing = (listingRaw as ListingRow | null) ?? null;
  const messages = (messagesRaw as DealMessageRow[] | null) ?? [];
  const profiles = (profilesRaw as ProfileRow[] | null) ?? [];

  const buyerProfile = profiles.find((p) => p.id === deal.buyer_id) ?? null;
  const sellerProfile = profiles.find((p) => p.id === deal.seller_id) ?? null;

  const myRole = user.id === deal.seller_id ? "판매자" : "구매자";
  const counterpartName =
    user.id === deal.seller_id
      ? displayName(buyerProfile, "구매자")
      : displayName(sellerProfile, "판매자");

  return (
    <main className="deal-page">
      <section className="deal-wrap">
        <div className="deal-head">
          <div className="deal-head-copy">
            <p className="deal-eyebrow">DEAL ROOM</p>
            <h1 className="deal-title">거래방</h1>
            <p className="deal-subtitle">
              거래 메시지와 상태를 확인할 수 있습니다.
            </p>
          </div>

          <div className="deal-head-actions">
            <Link href="/my/deals" className="deal-btn deal-btn-secondary">
              내 거래
            </Link>
            <Link
              href={listing ? `/listings/${listing.id}` : "/listings"}
              className="deal-btn deal-btn-primary"
            >
              원본 리스팅 보기
            </Link>
          </div>
        </div>

        <div className="deal-layout">
          <section className="deal-panel deal-info-panel">
            <div className="deal-panel-head">
              <h2>거래 정보</h2>
            </div>

            <div className="deal-info-grid">
              <article className="deal-info-card">
                <span className="deal-info-label">거래 ID</span>
                <strong className="deal-info-value deal-break-all">
                  {deal.id}
                </strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">상태</span>
                <strong className="deal-info-value">
                  {statusLabel(deal.status)}
                </strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">생성일</span>
                <strong className="deal-info-value">
                  {formatDate(deal.created_at)}
                </strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">내 역할</span>
                <strong className="deal-info-value">{myRole}</strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">상대</span>
                <strong className="deal-info-value">{counterpartName}</strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">리스팅 상태</span>
                <strong className="deal-info-value">
                  {listingStatusLabel(listing?.status ?? null)}
                </strong>
              </article>

              <article className="deal-info-card deal-info-card-wide">
                <span className="deal-info-label">리스팅 제목</span>
                <strong className="deal-info-value">
                  {listing?.title || "-"}
                </strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">카테고리</span>
                <strong className="deal-info-value">
                  {listing?.category || "-"}
                </strong>
              </article>

              <article className="deal-info-card">
                <span className="deal-info-label">희망 가격</span>
                <strong className="deal-info-value">
                  {formatPrice(listing?.price ?? null)}
                </strong>
              </article>

              <article className="deal-info-card deal-info-card-wide">
                <span className="deal-info-label">리스팅 ID</span>
                <strong className="deal-info-value deal-break-all">
                  {listing?.id || "-"}
                </strong>
              </article>
            </div>
          </section>

          <section className="deal-panel deal-message-panel">
            <div className="deal-panel-head">
              <h2>메시지</h2>
              <span className="deal-panel-meta">{messages.length}개</span>
            </div>

            <div className="deal-messages">
              {messages.length === 0 ? (
                <div className="deal-empty">
                  아직 메시지가 없습니다.
                </div>
              ) : (
                messages.map((message) => {
                  const mine = message.sender_id === user.id;
                  const sender =
                    message.sender_id === deal.seller_id
                      ? displayName(sellerProfile, "판매자")
                      : displayName(buyerProfile, "구매자");

                  return (
                    <article
                      key={message.id}
                      className={`deal-message ${mine ? "is-mine" : "is-other"}`}
                    >
                      <div className="deal-message-meta">
                        <span>{mine ? "나" : sender}</span>
                        <time>{formatDate(message.created_at)}</time>
                      </div>
                      <div className="deal-message-bubble">
                        {message.message || ""}
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <form
              action="/api/deal-messages/create"
              method="post"
              className="deal-message-form"
            >
              <input type="hidden" name="deal_id" value={deal.id} />
              <textarea
                name="message"
                required
                placeholder="메시지를 입력하세요."
                className="deal-message-textarea"
                rows={5}
              />
              <button type="submit" className="deal-btn deal-btn-primary">
                메시지 보내기
              </button>
            </form>
          </section>
        </div>
      </section>

      <style>{`
        .deal-page {
          min-height: calc(100dvh - 140px);
          padding: 24px 16px 120px;
          background: #f6f1e7;
        }

        .deal-wrap {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }

        .deal-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .deal-head-copy {
          min-width: 0;
        }

        .deal-eyebrow {
          margin: 0 0 10px;
          color: #9a7a57;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .deal-title {
          margin: 0;
          color: #1f140c;
          font-size: clamp(40px, 7vw, 72px);
          line-height: 0.95;
          letter-spacing: -0.05em;
          font-weight: 900;
        }

        .deal-subtitle {
          margin: 14px 0 0;
          color: #9a7a57;
          font-size: clamp(15px, 2vw, 18px);
          line-height: 1.6;
          font-weight: 700;
        }

        .deal-head-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .deal-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 22px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
          border: 1px solid transparent;
          box-sizing: border-box;
          cursor: pointer;
        }

        .deal-btn:hover {
          transform: translateY(-1px);
        }

        .deal-btn-primary {
          background: #2f1d10;
          color: #fff;
          box-shadow: 0 10px 24px rgba(47, 29, 16, 0.16);
        }

        .deal-btn-secondary {
          background: #efe4d4;
          color: #2f1d10;
          border-color: #e2d1ba;
        }

        .deal-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
          gap: 20px;
          align-items: start;
        }

        .deal-panel {
          min-width: 0;
          border: 1px solid #e5d8c8;
          border-radius: 32px;
          background: rgba(255, 252, 247, 0.82);
          box-shadow: 0 18px 40px rgba(47, 36, 23, 0.05);
          padding: 22px;
        }

        .deal-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .deal-panel-head h2 {
          margin: 0;
          color: #1f140c;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .deal-panel-meta {
          color: #9a7a57;
          font-size: 13px;
          font-weight: 800;
        }

        .deal-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .deal-info-card {
          min-width: 0;
          border: 1px solid #e6dacb;
          border-radius: 24px;
          background: #fffdfa;
          padding: 18px 18px 20px;
        }

        .deal-info-card-wide {
          grid-column: span 2;
        }

        .deal-info-label {
          display: block;
          margin-bottom: 10px;
          color: #9a7a57;
          font-size: 13px;
          font-weight: 800;
        }

        .deal-info-value {
          display: block;
          color: #20140c;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 900;
        }

        .deal-break-all {
          word-break: break-all;
          overflow-wrap: anywhere;
        }

        .deal-message-panel {
          display: flex;
          flex-direction: column;
          min-height: 720px;
        }

        .deal-messages {
          flex: 1;
          min-height: 380px;
          max-height: 640px;
          overflow-y: auto;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .deal-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          border: 1px dashed #ddcebb;
          border-radius: 24px;
          color: #9a7a57;
          background: #fffdfa;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
          padding: 20px;
        }

        .deal-message {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 88%;
        }

        .deal-message.is-mine {
          align-self: flex-end;
        }

        .deal-message.is-other {
          align-self: flex-start;
        }

        .deal-message-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8f7658;
          font-size: 12px;
          font-weight: 700;
        }

        .deal-message-bubble {
          border-radius: 22px;
          padding: 14px 16px;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 700;
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .deal-message.is-mine .deal-message-bubble {
          background: #2f1d10;
          color: #fff;
          border-bottom-right-radius: 10px;
        }

        .deal-message.is-other .deal-message-bubble {
          background: #f1e6d6;
          color: #2f1d10;
          border-bottom-left-radius: 10px;
        }

        .deal-message-form {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .deal-message-textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          border-radius: 20px;
          border: 1px solid #e3d5c3;
          background: #fff;
          padding: 16px;
          color: #20140c;
          font-size: 15px;
          line-height: 1.55;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .deal-message-textarea:focus {
          border-color: #b88a5b;
          box-shadow: 0 0 0 4px rgba(184, 138, 91, 0.14);
        }

        @media (max-width: 1080px) {
          .deal-layout {
            grid-template-columns: 1fr;
          }

          .deal-message-panel {
            min-height: 0;
          }

          .deal-messages {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .deal-page {
            padding: 18px 12px 108px;
          }

          .deal-head {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
            margin-bottom: 18px;
          }

          .deal-head-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .deal-btn {
            min-height: 48px;
            padding: 0 18px;
            font-size: 14px;
          }

          .deal-panel {
            border-radius: 24px;
            padding: 16px;
          }

          .deal-panel-head h2 {
            font-size: 20px;
          }

          .deal-info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .deal-info-card,
          .deal-info-card-wide {
            grid-column: span 1;
            border-radius: 20px;
            padding: 16px;
          }

          .deal-info-value {
            font-size: 16px;
          }

          .deal-message {
            max-width: 100%;
          }

          .deal-messages {
            min-height: 280px;
            gap: 10px;
          }

          .deal-message-bubble {
            font-size: 14px;
            padding: 13px 14px;
          }

          .deal-message-textarea {
            min-height: 108px;
            border-radius: 18px;
            font-size: 14px;
          }
        }

        @media (max-width: 420px) {
          .deal-title {
            font-size: 56px;
          }

          .deal-subtitle {
            font-size: 14px;
          }

          .deal-head-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .deal-btn {
            width: 100%;
            padding: 0 12px;
          }

          .deal-panel {
            padding: 14px;
            border-radius: 22px;
          }

          .deal-panel-head {
            margin-bottom: 14px;
          }

          .deal-panel-head h2 {
            font-size: 18px;
          }

          .deal-info-label {
            font-size: 12px;
          }

          .deal-info-value {
            font-size: 15px;
          }

          .deal-message-meta {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}