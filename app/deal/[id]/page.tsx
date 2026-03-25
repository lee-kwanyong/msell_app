import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealRow = Record<string, any>;
type ListingRow = Record<string, any>;
type MessageRow = Record<string, any>;

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatKRW(value: number) {
  return `₩${Math.round(value).toLocaleString("ko-KR")}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

function getDealStatus(row: DealRow) {
  return String(row.status ?? row.deal_status ?? "").toLowerCase();
}

function getDealStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "문의중";
    case "pending":
      return "검토중";
    case "in_progress":
      return "진행중";
    case "completed":
      return "거래완료";
    case "cancelled":
      return "취소됨";
    case "closed":
      return "종료";
    default:
      return "진행중";
  }
}

function getDealStatusTone(status: string) {
  switch (status) {
    case "open":
      return { bg: "#eefaf2", color: "#15803d", border: "#ccefd9" };
    case "pending":
      return { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" };
    case "in_progress":
      return { bg: "#eef4ff", color: "#1d4ed8", border: "#cddcfb" };
    case "completed":
      return { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };
    case "cancelled":
      return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
    case "closed":
      return { bg: "#f5f5f4", color: "#57534e", border: "#e7e5e4" };
    default:
      return { bg: "#f8f7f4", color: "#6b6258", border: "#e7dccb" };
  }
}

function getListingTitle(row?: ListingRow | null) {
  if (!row) return "연결된 매물 없음";
  return row.title || row.name || row.asset_name || "제목 없는 매물";
}

function getListingCategory(row?: ListingRow | null) {
  if (!row) return "디지털 자산";
  return row.category_label || row.category_name || row.category || "디지털 자산";
}

function getListingPrice(row?: ListingRow | null) {
  if (!row) return 0;
  return toNumber(row.price ?? row.ask_price ?? row.amount ?? row.total_price);
}

function getListingStatus(row?: ListingRow | null) {
  if (!row) return "";
  return String(row.status ?? "").toLowerCase();
}

function getListingStatusLabel(status: string) {
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
      return "보관됨";
    default:
      return "확인필요";
  }
}

function getRoleLabel(userId: string, deal: DealRow) {
  const sellerId = String(deal.seller_id ?? "");
  const buyerId = String(deal.buyer_id ?? "");

  if (sellerId && sellerId === String(userId)) return "판매자";
  if (buyerId && buyerId === String(userId)) return "구매자";
  return "참여자";
}

function getCounterpartyRoleLabel(userId: string, deal: DealRow) {
  const sellerId = String(deal.seller_id ?? "");
  const buyerId = String(deal.buyer_id ?? "");

  if (sellerId && sellerId === String(userId) && buyerId) return "상대방은 구매자";
  if (buyerId && buyerId === String(userId) && sellerId) return "상대방은 판매자";
  return "상대방 정보 확인 필요";
}

function isParticipant(userId: string, deal: DealRow) {
  return (
    String(deal.seller_id ?? "") === String(userId) ||
    String(deal.buyer_id ?? "") === String(userId)
  );
}

function getMessageText(row: MessageRow) {
  return String(row.message ?? "");
}

export default async function DealDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; ok?: string };
}) {
  const supabase = await supabaseServer();
  const dealId = params.id;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  if (!user) {
    redirect(`/auth/login?next=/deal/${dealId}`);
  }

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();

  if (!deal) {
    notFound();
  }

  if (!isParticipant(user.id, deal)) {
    redirect("/my/deals");
  }

  const [{ data: listing }, { data: messagesData }] = await Promise.all([
    deal.listing_id
      ? supabase.from("listings").select("*").eq("id", deal.listing_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("deal_messages")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: true }),
  ]);

  const messages = Array.isArray(messagesData) ? messagesData : [];
  const dealStatus = getDealStatus(deal);
  const statusTone = getDealStatusTone(dealStatus);
  const myRole = getRoleLabel(user.id, deal);
  const counterpartyRole = getCounterpartyRoleLabel(user.id, deal);
  const listingStatus = getListingStatus(listing);

  const errorText =
    searchParams?.error === "empty_message"
      ? "메시지를 입력한 뒤 전송해주세요."
      : searchParams?.error === "not_authenticated"
      ? "로그인 후 이용해주세요."
      : searchParams?.error === "deal_not_found"
      ? "거래방을 찾을 수 없습니다."
      : searchParams?.error === "not_participant"
      ? "이 거래방에 접근할 수 없습니다."
      : searchParams?.error === "message_create_failed"
      ? "메시지 전송에 실패했습니다. 다시 시도해주세요."
      : "";

  const okText =
    searchParams?.ok === "sent" ? "메시지가 전송되었습니다." : "";

  return (
    <main
      style={{
        background: "#f6f1e7",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "36px 20px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Link
                href="/my/deals"
                style={{
                  color: "#6f6458",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ← 내 거래
              </Link>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: statusTone.bg,
                  color: statusTone.color,
                  border: `1px solid ${statusTone.border}`,
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {getDealStatusLabel(dealStatus)}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f6efe4",
                  color: "#6b5640",
                  border: "1px solid #e7dccb",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {myRole}
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                color: "#1f160d",
                fontSize: "clamp(30px, 4vw, 42px)",
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                wordBreak: "break-word",
              }}
            >
              {getListingTitle(listing)}
            </h1>

            <div
              style={{
                marginTop: 10,
                color: "#6f6458",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {getListingCategory(listing)} · 거래 생성일 {formatDateTime(deal.created_at)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {deal.listing_id ? (
              <Link
                href={`/listings/${deal.listing_id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 12,
                  background: "#eadfcf",
                  color: "#2f2417",
                  fontWeight: 800,
                  textDecoration: "none",
                  border: "1px solid #dfd0bb",
                }}
              >
                매물 보기
              </Link>
            ) : null}

            <Link
              href="/my/deals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 46,
                padding: "0 18px",
                borderRadius: 12,
                background: "#ffffff",
                color: "#2f2417",
                fontWeight: 800,
                textDecoration: "none",
                border: "1px solid #e1d4c1",
              }}
            >
              거래 목록
            </Link>
          </div>
        </div>

        {errorText ? (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: 18,
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {errorText}
          </div>
        ) : null}

        {okText ? (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              borderRadius: 18,
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {okText}
          </div>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(340px, 0.9fr)",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,247,241,0.98) 100%)",
              border: "1px solid #e7dccb",
              borderRadius: 32,
              padding: "30px 28px",
              boxShadow: "0 18px 40px rgba(47, 36, 23, 0.07)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 34,
                padding: "0 14px",
                borderRadius: 999,
                background: "#f3ece0",
                border: "1px solid #e6d9c7",
                color: "#5b4a35",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              거래 진행 요약
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background: "#fffdfa",
                  border: "1px solid #ece2d3",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                  연결 매물 금액
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#1f160d",
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {formatKRW(getListingPrice(listing))}
                </div>
              </div>

              <div
                style={{
                  background: "#fffdfa",
                  border: "1px solid #ece2d3",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                  내 역할
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#1f160d",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {myRole}
                </div>
              </div>

              <div
                style={{
                  background: "#fffdfa",
                  border: "1px solid #ece2d3",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                  매물 상태
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "#1f160d",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {listing ? getListingStatusLabel(listingStatus) : "확인불가"}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e7dccb",
                borderRadius: 24,
                padding: 22,
              }}
            >
              <div
                style={{
                  color: "#1f160d",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                진행 단계 가이드
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {[
                  {
                    title: "1. 문의 시작",
                    text: "매물에서 거래 문의가 시작되면 별도 거래방이 생성됩니다.",
                  },
                  {
                    title: "2. 조건 조율",
                    text: "가격, 이전 일정, 세부 진행 내용을 이 거래방에서 정리합니다.",
                  },
                  {
                    title: "3. 진행 상태 반영",
                    text: "실제 진행 상황에 맞게 문의중·검토중·진행중·완료 상태를 관리합니다.",
                  },
                  {
                    title: "4. 매물 상태 확인",
                    text: "매물 상태와 거래 상태가 서로 어긋나지 않도록 함께 관리하는 것이 중요합니다.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: "#fffdfa",
                      border: "1px solid #ebe1d2",
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        color: "#1f160d",
                        fontSize: 16,
                        fontWeight: 800,
                        marginBottom: 6,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: "#6f6458",
                        fontSize: 14,
                        lineHeight: 1.75,
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e7dccb",
                borderRadius: 28,
                padding: 24,
                boxShadow: "0 12px 32px rgba(47, 36, 23, 0.06)",
              }}
            >
              <div
                style={{
                  color: "#1f160d",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                거래방 정보
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    background: "#fcfaf6",
                    border: "1px solid #ece2d3",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                    현재 거래 상태
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 32,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: statusTone.bg,
                      color: statusTone.color,
                      border: `1px solid ${statusTone.border}`,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {getDealStatusLabel(dealStatus)}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fcfaf6",
                    border: "1px solid #ece2d3",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                    상대 역할
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: "#1f160d",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {counterpartyRole}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fcfaf6",
                    border: "1px solid #ece2d3",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ color: "#7a6f63", fontSize: 12, fontWeight: 700 }}>
                    마지막 갱신
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: "#1f160d",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {formatDateTime(deal.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #2f2417 0%, #433222 100%)",
                border: "1px solid #3d2f21",
                borderRadius: 28,
                padding: 24,
                boxShadow: "0 14px 34px rgba(47, 36, 23, 0.16)",
              }}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                메시지 전송
              </div>

              <div
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 14,
                  lineHeight: 1.75,
                  marginBottom: 18,
                }}
              >
                조건과 진행 상황은 이 거래방에서 정리하세요. 메시지는 같은 거래방에 계속 누적됩니다.
              </div>

              <form action="/api/deal-messages/create" method="post" style={{ display: "grid", gap: 12 }}>
                <input type="hidden" name="deal_id" value={dealId} />

                <textarea
                  name="message"
                  placeholder="거래 조건, 일정, 확인할 내용을 입력하세요."
                  rows={5}
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    padding: "14px 16px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    resize: "vertical",
                    outline: "none",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    height: 50,
                    borderRadius: 14,
                    border: "none",
                    background: "#ffffff",
                    color: "#2f2417",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  메시지 전송
                </button>
              </form>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e7dccb",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 12px 32px rgba(47, 36, 23, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  color: "#1f160d",
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                거래 메시지
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "#756b61",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                보낸 사람과 상대방이 명확히 구분되도록 정리했습니다.
              </div>
            </div>

            <div
              style={{
                color: "#6f6458",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              총 {messages.length.toLocaleString("ko-KR")}개 메시지
            </div>
          </div>

          {messages.length === 0 ? (
            <div
              style={{
                border: "1px dashed #ddcfbb",
                background: "#fcfaf6",
                borderRadius: 22,
                padding: 28,
                color: "#7a6f63",
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              아직 메시지가 없습니다.
              <br />
              거래 조건과 진행 계획을 먼저 정리해두면 이후 상태 관리가 훨씬 쉬워집니다.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              {messages.map((message) => {
                const mine = String(message.sender_id ?? "") === String(user.id);

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
                        width: "min(720px, 100%)",
                        background: mine ? "#2f2417" : "#fffdfa",
                        color: mine ? "#ffffff" : "#1f160d",
                        border: mine ? "1px solid #2f2417" : "1px solid #ece2d3",
                        borderRadius: 22,
                        padding: 18,
                        boxShadow: mine
                          ? "0 12px 26px rgba(47, 36, 23, 0.14)"
                          : "0 8px 22px rgba(47, 36, 23, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 10,
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: mine ? "rgba(255,255,255,0.78)" : "#6f6458",
                          }}
                        >
                          {mine ? "내 메시지" : "상대방 메시지"}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: mine ? "rgba(255,255,255,0.66)" : "#8a7f73",
                          }}
                        >
                          {formatDateTime(message.created_at)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {getMessageText(message)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <style>{`
        textarea::placeholder {
          color: rgba(255,255,255,0.55);
        }

        @media (max-width: 1080px) {
          section[style*="grid-template-columns: minmax(0, 1.3fr) minmax(340px, 0.9fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 840px) {
          div[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}