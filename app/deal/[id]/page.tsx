import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    ok?: string;
  }>;
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
  price: number | string | null;
  category: string | null;
  status: string | null;
  user_id: string | null;
};

type MessageRow = {
  id: string;
  deal_id: string;
  sender_id: string | null;
  message: string | null;
  created_at: string | null;
};

export default async function DealDetailPage({
  params,
  searchParams,
}: DealPageProps) {
  const supabase = await supabaseServer();
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/deal/${id}`);
  }

  const { data: dealRaw, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();

  if (dealError || !dealRaw) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f6f1e7",
          padding: "40px 20px 80px",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 28,
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#2f2417",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              거래방을 찾을 수 없습니다
            </h1>
            <p style={{ marginTop: 12, color: "#6b5b4b" }}>
              존재하지 않거나 접근 권한이 없습니다.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link
                href="/my/deals"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#2f2417",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                내 거래로 이동
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const deal = dealRaw as DealRow;
  const isParticipant =
    deal.buyer_id === user.id || deal.seller_id === user.id;

  if (!isParticipant) {
    redirect("/my/deals");
  }

  const [{ data: listingRaw }, { data: messagesRaw }] = await Promise.all([
    deal.listing_id
      ? supabase.from("listings").select("*").eq("id", deal.listing_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("deal_messages")
      .select("*")
      .eq("deal_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const listing = (listingRaw ?? null) as ListingRow | null;
  const messages = ((messagesRaw ?? []) as MessageRow[]).filter(
    (item) => item.deal_id === id
  );

  const infoRows = [
    { label: "거래 ID", value: deal.id },
    { label: "상태", value: deal.status || "-" },
    { label: "생성일", value: deal.created_at || "-" },
    { label: "리스팅 ID", value: deal.listing_id || "-" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "28px 16px 90px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.2,
                color: "#2f2417",
                fontWeight: 800,
              }}
            >
              거래방
            </h1>
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "#6b5b4b",
                fontSize: 15,
              }}
            >
              거래 메시지와 상태를 확인할 수 있습니다.
            </p>
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
                textDecoration: "none",
                padding: "12px 14px",
                borderRadius: 12,
                background: "#eadfcf",
                color: "#2f2417",
                fontWeight: 700,
              }}
            >
              내 거래
            </Link>

            {listing?.id ? (
              <Link
                href={`/listings/${listing.id}`}
                style={{
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "#2f2417",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                원본 리스팅 보기
              </Link>
            ) : null}
          </div>
        </div>

        {resolvedSearchParams?.ok ? (
          <div
            style={{
              borderRadius: 18,
              padding: 14,
              border: "1px solid #cdb38d",
              background: "#fffaf2",
              color: "#2f2417",
            }}
          >
            {resolvedSearchParams.ok}
          </div>
        ) : null}

        {resolvedSearchParams?.error ? (
          <div
            style={{
              borderRadius: 18,
              padding: 14,
              border: "1px solid #e6c2c2",
              background: "#fff7f7",
              color: "#7a2e2e",
            }}
          >
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px minmax(0, 1fr)",
            gap: 20,
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 22,
              height: "fit-content",
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 16,
                color: "#2f2417",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              거래 정보
            </h2>

            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    borderRadius: 16,
                    border: "1px solid #eadfcf",
                    background: "#fcfaf6",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8b7a67",
                      marginBottom: 6,
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#2f2417",
                      fontWeight: 700,
                      wordBreak: "break-all",
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 18,
                border: "1px solid #eadfcf",
                background: "#fff",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#8b7a67",
                  marginBottom: 8,
                }}
              >
                연결 리스팅
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#2f2417",
                  fontWeight: 800,
                }}
              >
                {listing?.title || "리스팅 정보 없음"}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#5f5142",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                카테고리: {listing?.category || "-"}
                <br />
                가격: {listing?.price ?? "-"}
                <br />
                상태: {listing?.status || "-"}
              </div>
            </div>
          </section>

          <section
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
              minWidth: 0,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 16,
                color: "#2f2417",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              메시지
            </h2>

            <div
              style={{
                display: "grid",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #dfd0bb",
                    borderRadius: 18,
                    padding: 18,
                    background: "#fcfaf6",
                    color: "#7a6a59",
                  }}
                >
                  아직 메시지가 없습니다.
                </div>
              ) : (
                messages.map((item) => {
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
                          background: mine ? "#2f2417" : "#f3ede3",
                          color: mine ? "#ffffff" : "#2f2417",
                          border: mine
                            ? "1px solid #2f2417"
                            : "1px solid #eadfcf",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                          }}
                        >
                          {item.message || ""}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            opacity: 0.8,
                          }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("ko-KR")
                            : "-"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              action="/api/deal-messages/create"
              method="post"
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <input type="hidden" name="deal_id" value={deal.id} />
              <textarea
                name="message"
                required
                placeholder="메시지를 입력하세요"
                rows={5}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: 16,
                  border: "1px solid #d9c9b3",
                  padding: 14,
                  fontSize: 15,
                  outline: "none",
                  background: "#fffdf9",
                  color: "#2f2417",
                }}
              />
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: "#2f2417",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 15,
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