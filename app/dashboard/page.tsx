import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { listMyListings } from "@/lib/listings/server";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const myPosts = await listMyListings(user.id);

  return (
    <main>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>내 게시글</h1>
          <p className="muted" style={{ marginTop: 6 }}>내가 올린 팝니다/삽니다 글을 관리합니다.</p>
        </div>

        <div className="row">
          <Link className="btn secondary" href="/board?type=sell">게시판</Link>
          <Link className="btn" href="/listings/new">글쓰기</Link>
        </div>
      </div>

      {myPosts.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 800 }}>아직 등록한 글이 없어요</div>
          <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
            게시판에서 <b>팝니다/삽니다</b> 글을 등록해보세요.
          </div>
          <div className="row" style={{ marginTop: 12, justifyContent: "flex-end" }}>
            <Link className="btn secondary" href="/board?type=sell">게시판</Link>
            <Link className="btn" href="/listings/new">글쓰기</Link>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {myPosts.map((p) => (
            <Link key={p.id} href={`/listings/${p.id}`} className="card" style={{ display: "block" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge">{p.post_type === "sell" ? "팝니다" : "삽니다"}</span>
                <span className="badge">{p.status}</span>
              </div>
              <div style={{ fontWeight: 800, marginTop: 10 }}>{p.title}</div>
              <div className="muted" style={{ marginTop: 6, lineHeight: 1.4 }}>{p.description?.slice(0, 120) || "—"}</div>
              <div style={{ marginTop: 10, fontWeight: 700 }}>₩{Number(p.asking_price_krw).toLocaleString("ko-KR")}</div>
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>{new Date(p.created_at).toLocaleString("ko-KR")}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
