import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR").format(Number(value ?? 0));
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRoleLabel(isSeller: boolean) {
  return isSeller ? "판매자" : "구매자";
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "chatting":
      return "대화중";
    case "pending":
      return "대기중";
    case "completed":
      return "완료";
    case "cancelled":
      return "취소";
    default:
      return status || "-";
  }
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/deal/${id}`)}`);
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("id, buyer_id, seller_id, listing_id, status, created_at")
    .eq("id", id)
    .single();

  if (dealError || !deal) {
    notFound();
  }

  const isParticipant =
    deal.buyer_id === user.id || deal.seller_id === user.id;

  if (!isParticipant) {
    redirect("/my/deals");
  }

  const isSeller = deal.seller_id === user.id;
  const partnerId = isSeller ? deal.buyer_id : deal.seller_id;

  let listing:
    | {
        id: string;
        title: string | null;
        price: number | null;
        category: string | null;
      }
    | null = null;

  if (deal.listing_id) {
    const { data } = await supabase
      .from("listings")
      .select("id, title, price, category")
      .eq("id", deal.listing_id)
      .maybeSingle();

    listing = data;
  }

  const { data: messages } = await supabase
    .from("deal_messages")
    .select("id, sender_id, content, created_at")
    .eq("deal_id", id)
    .order("created_at", { ascending: true });

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("deal_id", id)
    .eq("is_read", false);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        background: "#f6f1e7",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 20 }}>
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#9a866f",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Deal Room
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 48,
                lineHeight: 1.05,
                color: "#2f2417",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              거래 문의
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#7a6856",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              거래 상대와 메시지를 주고받고, 현재 거래 상태를 바로 확인할 수 있습니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/my/deals"
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 16,
                background: "#eadfcf",
                color: "#2f2417",
                textDecoration: "none",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              내 거래로 돌아가기
            </Link>

            <Link
              href={listing?.id ? `/listings/${listing.id}` : "/listings"}
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 16,
                background: "#ffffff",
                border: "1px solid #eadfcf",
                color: "#2f2417",
                textDecoration: "none",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              원본 리스팅 보기
            </Link>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 30,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {[
            { label: "리스팅", value: listing?.title || "-" },
            { label: "카테고리", value: listing?.category || "-" },
            { label: "가격", value: `${formatPrice(listing?.price)}원` },
            { label: "내 역할", value: getRoleLabel(isSeller) },
            { label: "거래 상태", value: getStatusLabel(deal.status) },
            { label: "상대방 ID", value: partnerId },
            { label: "생성일", value: formatDateTime(deal.created_at) },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#f8f4ec",
                border: "1px solid #eadfcf",
                borderRadius: 20,
                padding: "18px 18px 16px",
                minHeight: 92,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#9a866f",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  color: "#2f2417",
                  fontWeight: 900,
                  fontSize: item.label === "상대방 ID" ? 18 : 17,
                  lineHeight: 1.45,
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 30,
            padding: 20,
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 24,
              color: "#2f2417",
              fontWeight: 900,
            }}
          >
            대화
          </h2>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginBottom: 18,
              minHeight: 120,
            }}
          >
            {(messages ?? []).length === 0 ? (
              <div
                style={{
                  background: "#f8f4ec",
                  border: "1px solid #eadfcf",
                  borderRadius: 20,
                  padding: "18px 16px",
                  color: "#7a6856",
                  fontSize: 15,
                }}
              >
                아직 메시지가 없습니다. 첫 메시지를 보내 거래를 시작해보세요.
              </div>
            ) : null}

            {(messages ?? []).map((message) => {
              const mine = message.sender_id === user.id;

              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "fit-content",
                      maxWidth: "78%",
                      background: mine ? "#2f2417" : "#f8f4ec",
                      color: mine ? "#ffffff" : "#2f2417",
                      border: mine ? "none" : "1px solid #eadfcf",
                      borderRadius: 22,
                      padding: "14px 16px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {message.content}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: mine ? "rgba(255,255,255,0.74)" : "#8b7967",
                        fontWeight: 700,
                      }}
                    >
                      {formatDateTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form method="post" action="/api/deal-messages/create">
            <input type="hidden" name="deal_id" value={id} />

            <div
              style={{
                border: "1px solid #d9cbb8",
                borderRadius: 22,
                background: "#fffdf9",
                padding: 12,
              }}
            >
              <textarea
                name="content"
                placeholder="메시지를 입력하세요"
                required
                rows={5}
                style={{
                  width: "100%",
                  resize: "vertical",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "#2f2417",
                  fontSize: 16,
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <button
                type="submit"
                style={{
                  height: 46,
                  padding: "0 18px",
                  border: "none",
                  borderRadius: 16,
                  background: "#2f2417",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                메시지 보내기
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}