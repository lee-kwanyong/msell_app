import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealRow = {
  id: string;
  created_at: string | null;
  listing_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  status: string | null;
};

type NotificationRow = {
  id: string;
  created_at: string | null;
  title: string | null;
  body: string | null;
  type: string | null;
  deal_id: string | null;
  is_read: boolean | null;
};

export default async function InboxPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/inbox");
  }

  const [{ data: notifications }, { data: deals }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, created_at, title, body, type, deal_id, is_read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("deals")
      .select("id, created_at, listing_id, buyer_id, seller_id, status")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const safeNotifications = (notifications ?? []) as NotificationRow[];
  const safeDeals = (deals ?? []) as DealRow[];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.2,
              color: "#2f2417",
              fontWeight: 800,
            }}
          >
            Inbox
          </h1>
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#6b5b4b",
              fontSize: 15,
            }}
          >
            알림과 최근 거래방을 한 번에 확인합니다.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 20,
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: "#2f2417",
                  fontWeight: 800,
                }}
              >
                최근 알림
              </h2>
              <Link
                href="/notifications"
                style={{
                  textDecoration: "none",
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                전체 보기
              </Link>
            </div>

            {safeNotifications.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #dfd0bb",
                  borderRadius: 18,
                  padding: 20,
                  color: "#7a6a59",
                  background: "#fcfaf6",
                }}
              >
                아직 알림이 없습니다.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {safeNotifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.deal_id ? `/deal/${item.deal_id}` : "/notifications"}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: item.is_read
                          ? "1px solid #eadfcf"
                          : "1px solid #c9ae87",
                        background: item.is_read ? "#fff" : "#fffaf2",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <strong
                          style={{
                            color: "#2f2417",
                            fontSize: 15,
                            fontWeight: 800,
                          }}
                        >
                          {item.title || "새 알림"}
                        </strong>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#8b7a67",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("ko-KR")
                            : "-"}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          color: "#5f5142",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.body || "내용이 없습니다."}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          color: "#8b7a67",
                        }}
                      >
                        유형: {item.type || "general"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: "#2f2417",
                  fontWeight: 800,
                }}
              >
                최근 거래방
              </h2>
              <Link
                href="/my/deals"
                style={{
                  textDecoration: "none",
                  color: "#2f2417",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                내 거래 보기
              </Link>
            </div>

            {safeDeals.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #dfd0bb",
                  borderRadius: 18,
                  padding: 20,
                  color: "#7a6a59",
                  background: "#fcfaf6",
                }}
              >
                진행 중인 거래가 없습니다.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {safeDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deal/${deal.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: "1px solid #eadfcf",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <strong
                          style={{
                            color: "#2f2417",
                            fontSize: 15,
                            fontWeight: 800,
                          }}
                        >
                          Deal #{deal.id.slice(0, 8)}
                        </strong>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#8b7a67",
                          }}
                        >
                          {deal.status || "pending"}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          color: "#6b5b4b",
                          lineHeight: 1.6,
                        }}
                      >
                        Listing: {deal.listing_id || "-"}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "#8b7a67",
                        }}
                      >
                        {deal.created_at
                          ? new Date(deal.created_at).toLocaleString("ko-KR")
                          : "-"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}