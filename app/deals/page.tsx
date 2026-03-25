import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealListRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string | null;
  created_at: string | null;
  listings:
    | {
        id: string;
        asset: string | null;
        type: string | null;
        price: number | null;
        quantity: number | null;
        status: string | null;
        posts:
          | {
              id: string;
              title: string | null;
            }
          | {
              id: string;
              title: string | null;
            }[]
          | null;
      }
    | {
        id: string;
        asset: string | null;
        type: string | null;
        price: number | null;
        quantity: number | null;
        status: string | null;
        posts:
          | {
              id: string;
              title: string | null;
            }
          | {
              id: string;
              title: string | null;
            }[]
          | null;
      }[]
    | null;
};

function formatStatus(status: string | null) {
  if (!status) return "unknown";
  return status;
}

export default async function MyDealsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?next=%2Fmy%2Fdeals");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_banned) {
    return (
      <div className="boardWrap">
        <div
          className="boardCard"
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gap: 14,
          }}
        >
          <div className="boardTitle" style={{ fontSize: 30 }}>
            접근 불가
          </div>
          <div className="boardSub">
            차단된 계정은 거래 페이지를 이용할 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      status,
      created_at,
      listings (
        id,
        asset,
        type,
        price,
        quantity,
        status,
        posts (
          id,
          title
        )
      )
    `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="boardWrap">
        <div
          className="boardCard"
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gap: 14,
          }}
        >
          <div className="boardTitle" style={{ fontSize: 30 }}>
            Error
          </div>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 18,
              background: "rgba(255,59,48,.08)",
              border: "1px solid rgba(255,59,48,.14)",
              color: "#b42318",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  const deals = (data ?? []) as DealListRow[];

  return (
    <div className="boardWrap">
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <section className="boardCard" style={{ display: "grid", gap: 10 }}>
          <div className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
            My Deals
          </div>
          <div className="boardTitle" style={{ fontSize: 36 }}>
            My deal rooms
          </div>
          <div className="boardSub">
            내가 buyer 또는 seller 로 참여 중인 거래 목록입니다.
          </div>
        </section>

        {deals.length === 0 ? (
          <section className="boardCard">
            <div className="emptyPanel">
              <div className="emptyHead">No deals yet</div>
              <div className="boardSub">
                아직 참여 중인 거래가 없습니다. listing 에서 거래를 시작해보세요.
              </div>
              <div className="btnRow" style={{ marginTop: 14 }}>
                <Link href="/listings" className="btn btnPrimary">
                  Explore Listings
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section style={{ display: "grid", gap: 14 }}>
            {deals.map((deal) => {
              const listing = Array.isArray(deal.listings)
                ? deal.listings[0]
                : deal.listings;

              const post = listing?.posts
                ? Array.isArray(listing.posts)
                  ? listing.posts[0]
                  : listing.posts
                : null;

              const myRole = deal.buyer_id === user.id ? "Buyer" : "Seller";
              const counterpartyId =
                deal.buyer_id === user.id ? deal.seller_id : deal.buyer_id;

              return (
                <article
                  key={deal.id}
                  className="boardCard"
                  style={{
                    display: "grid",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <div className="boardTitle" style={{ fontSize: 26 }}>
                        {post?.title ?? "Untitled Deal"}
                      </div>
                      <div className="boardSub">
                        Deal #{deal.id.slice(0, 8)} · {myRole}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,.10)",
                        background: "rgba(255,255,255,.72)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {formatStatus(deal.status)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="emptyPanel">
                      <div className="emptyHead">Asset</div>
                      <div className="boardSub">{listing?.asset ?? "-"}</div>
                    </div>

                    <div className="emptyPanel">
                      <div className="emptyHead">Type</div>
                      <div className="boardSub">{listing?.type ?? "-"}</div>
                    </div>

                    <div className="emptyPanel">
                      <div className="emptyHead">Price</div>
                      <div className="boardSub">
                        {listing?.price != null
                          ? listing.price.toLocaleString()
                          : "-"}
                      </div>
                    </div>

                    <div className="emptyPanel">
                      <div className="emptyHead">Quantity</div>
                      <div className="boardSub">
                        {listing?.quantity != null
                          ? listing.quantity.toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="emptyPanel">
                      <div className="emptyHead">Counterparty</div>
                      <div className="boardSub" style={{ wordBreak: "break-all" }}>
                        {counterpartyId}
                      </div>
                    </div>

                    <div className="emptyPanel">
                      <div className="emptyHead">Created</div>
                      <div className="boardSub">
                        {deal.created_at
                          ? new Date(deal.created_at).toLocaleString("ko-KR")
                          : "-"}
                      </div>
                    </div>

                    <div className="emptyPanel">
                      <div className="emptyHead">Listing Status</div>
                      <div className="boardSub">{listing?.status ?? "-"}</div>
                    </div>
                  </div>

                  <div className="btnRow">
                    <Link href={`/deal/${deal.id}`} className="btn btnPrimary">
                      Open Deal Room
                    </Link>

                    <Link href={`/listings/${deal.listing_id}`} className="btn">
                      View Listing
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}