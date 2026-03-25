import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  status: string | null;
  created_at: string | null;
  user_id: string | null;
};

type DealRow = {
  id: string;
  listing_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  status: string | null;
  created_at: string | null;
};

export default async function DashboardPage() {
  const sb = await supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const [listingsRes, dealsRes, notificationsRes] = await Promise.all([
    sb
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    sb
      .from("deals")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(8),
    sb
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  const listings = (listingsRes.data ?? []) as ListingRow[];
  const deals = (dealsRes.data ?? []) as DealRow[];
  const unreadCount = notificationsRes.count ?? 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 20 }}>
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
            Dashboard
          </h1>
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#6b5b4b",
              fontSize: 15,
            }}
          >
            내 리스팅, 거래, 알림 현황을 한 번에 확인합니다.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "#8b7a67" }}>내 리스팅</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, color: "#2f2417" }}>
              {listings.length}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "#8b7a67" }}>내 거래</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, color: "#2f2417" }}>
              {deals.length}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "#8b7a67" }}>읽지 않은 알림</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, color: "#2f2417" }}>
              {unreadCount}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2f2417" }}>
                최근 내 리스팅
              </h2>
              <Link
                href="/my/listings"
                style={{ textDecoration: "none", color: "#2f2417", fontWeight: 700 }}
              >
                전체 보기
              </Link>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {listings.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #dfd0bb",
                    borderRadius: 16,
                    padding: 18,
                    background: "#fcfaf6",
                    color: "#7a6a59",
                  }}
                >
                  등록한 리스팅이 없습니다.
                </div>
              ) : (
                listings.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        border: "1px solid #eadfcf",
                        borderRadius: 16,
                        padding: 16,
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#2f2417" }}>
                        {item.title || "제목 없음"}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 14, color: "#6b5b4b", lineHeight: 1.6 }}>
                        카테고리: {item.category || "-"}
                        <br />
                        가격: {item.price ?? "-"}
                        <br />
                        상태: {item.status || "-"}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              border: "1px solid #eadfcf",
              borderRadius: 24,
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2f2417" }}>
                최근 거래
              </h2>
              <Link
                href="/my/deals"
                style={{ textDecoration: "none", color: "#2f2417", fontWeight: 700 }}
              >
                전체 보기
              </Link>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {deals.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #dfd0bb",
                    borderRadius: 16,
                    padding: 18,
                    background: "#fcfaf6",
                    color: "#7a6a59",
                  }}
                >
                  진행 중인 거래가 없습니다.
                </div>
              ) : (
                deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deal/${deal.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        border: "1px solid #eadfcf",
                        borderRadius: 16,
                        padding: 16,
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#2f2417" }}>
                        Deal #{deal.id.slice(0, 8)}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 14, color: "#6b5b4b", lineHeight: 1.6 }}>
                        상태: {deal.status || "-"}
                        <br />
                        Listing: {deal.listing_id || "-"}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}