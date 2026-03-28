import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function decodeValue(value?: string) {
  return value ? decodeURIComponent(value) : "";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(value: number | string | null | undefined) {
  const price =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;

  if (!Number.isFinite(price)) return "-";
  return `${price.toLocaleString("ko-KR")}원`;
}

function mapErrorMessage(error: string) {
  if (error === "missing_deal_id") return "거래방 정보가 없습니다.";
  if (error === "deal_not_found") return "거래방을 찾을 수 없습니다.";
  if (error === "not_deal_participant") return "이 거래방에 접근할 수 없습니다.";
  if (error.startsWith("failed_to_send_message:")) {
    return `메시지 전송 실패: ${error.replace("failed_to_send_message:", "")}`;
  }
  return error;
}

export default async function DealDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const rawError = decodeValue(query?.error);
  const success = decodeValue(query?.success);

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/deal/${id}`);
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();

  if (dealError || !deal) {
    redirect("/my/deals");
  }

  const isParticipant =
    deal.seller_id === user.id || deal.buyer_id === user.id;

  if (!isParticipant) {
    redirect("/my/deals");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", deal.listing_id)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("deal_messages")
    .select("*")
    .eq("deal_id", id)
    .order("created_at", { ascending: true });

  const messageRows = messages ?? [];
  const listingTitle =
    typeof listing?.title === "string" && listing.title.trim()
      ? listing.title
      : "연결된 리스팅";
  const listingCategory =
    typeof listing?.category === "string" ? listing.category : "-";
  const listingStatus =
    typeof listing?.status === "string" ? listing.status : "-";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 96px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#16110d",
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              거래방
            </h1>
            <div
              style={{
                marginTop: 8,
                color: "#8a7156",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              거래 메시지와 상태를 확인할 수 있습니다.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/my/deals"
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#f1e7d8",
                color: "#2f2417",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              내 거래
            </Link>

            <Link
              href={listing ? `/listings/${listing.id}` : "/listings"}
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#2f2417",
                color: "#fffaf2",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              원본 리스팅 보기
            </Link>
          </div>
        </div>

        {rawError ? (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 18,
              border: "1px solid #efc0c0",
              background: "#fff4f4",
              color: "#b42318",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}
          >
            {mapErrorMessage(rawError)}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 18,
              border: "1px solid #cfe3c7",
              background: "#f5fbf2",
              color: "#2f6b2f",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {success}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px minmax(0, 1fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 28,
              padding: 16,
              boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                color: "#16110d",
                fontSize: 16,
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              거래 정보
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  거래 ID
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 13,
                    fontWeight: 800,
                    wordBreak: "break-all",
                  }}
                >
                  {deal.id}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  상태
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {deal.status || "-"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  생성일
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {formatDateTime(deal.created_at)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  리스팅 ID
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 13,
                    fontWeight: 800,
                    wordBreak: "break-all",
                  }}
                >
                  {deal.listing_id}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  연결 리스팅
                </div>
                <div
                  style={{
                    color: "#24190f",
                    fontSize: 14,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  {listingTitle}
                </div>
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  카테고리: {listingCategory}
                  <br />
                  가격: {formatPrice(listing?.price)}
                  <br />
                  상태: {listingStatus}
                </div>
              </div>
            </div>
          </aside>

          <section
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 28,
              padding: 16,
              boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                color: "#16110d",
                fontSize: 16,
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              메시지
            </div>

            <div
              style={{
                minHeight: 260,
                borderRadius: 22,
                background: "#fffdf9",
                border: "1px solid #eadfcf",
                padding: 14,
                marginBottom: 14,
              }}
            >
              {messageRows.length === 0 ? (
                <div
                  style={{
                    color: "#8a7156",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "1px dashed #eadfcf",
                    borderRadius: 16,
                    padding: "18px 14px",
                  }}
                >
                  아직 메시지가 없습니다.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {messageRows.map((item: any) => {
                    const mine = item.sender_id === user.id;

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "78%",
                            borderRadius: 18,
                            padding: "12px 14px",
                            background: mine ? "#2f2417" : "#f4eadc",
                            color: mine ? "#fffaf2" : "#24190f",
                            fontSize: 14,
                            lineHeight: 1.7,
                            fontWeight: 600,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          <div>{item.message || "-"}</div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              opacity: 0.72,
                              fontWeight: 700,
                            }}
                          >
                            {formatDateTime(item.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form method="post" action="/api/deal-messages/create">
              <input type="hidden" name="deal_id" value={id} />
              <textarea
                name="message"
                placeholder="메시지를 입력하세요"
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  border: "1px solid #d9c7b3",
                  background: "#fffdf9",
                  padding: "14px 16px",
                  color: "#24190f",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.7,
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  minHeight: 52,
                  borderRadius: 16,
                  border: 0,
                  marginTop: 10,
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                메시지 보내기
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}