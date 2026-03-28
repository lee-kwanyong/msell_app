import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type BoardPostRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function maskAuthor(userId: string) {
  if (!userId) return "-";
  return userId.slice(0, 8);
}

export default async function BoardPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, user_id, title, content, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  const rows: BoardPostRow[] = error ? [] : ((data ?? []) as BoardPostRow[]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 96px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section
          style={{
            background:
              "linear-gradient(135deg, #2b1d12 0%, #4a2f1b 52%, #77502d 100%)",
            borderRadius: 34,
            padding: 30,
            color: "#fffaf2",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 64px rgba(55, 35, 17, 0.16)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.16em",
              opacity: 0.8,
              marginBottom: 14,
            }}
          >
            BOARD
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                게시판
              </h1>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "rgba(255,250,242,0.86)",
                  fontWeight: 600,
                }}
              >
                회원은 게시글을 작성할 수 있고, 답변은 관리자만 등록할 수 있습니다.
              </p>
            </div>

            <Link
              href={user ? "/board/create" : "/auth/login?next=/board/create"}
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#f3e6d3",
                color: "#2f2417",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              글쓰기
            </Link>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 30,
            boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px minmax(0, 1fr) 120px 140px",
              padding: "16px 20px",
              background: "#f5ede2",
              borderBottom: "1px solid #eadfce",
              color: "#7f684f",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <div>상태</div>
            <div>제목</div>
            <div>작성자</div>
            <div>작성일</div>
          </div>

          {error ? (
            <div
              style={{
                padding: "28px 20px",
                color: "#b42318",
                fontSize: 14,
                fontWeight: 700,
                background: "#fff4f4",
              }}
            >
              게시판 데이터를 불러오지 못했습니다: {error.message}
            </div>
          ) : rows.length === 0 ? (
            <div
              style={{
                padding: "36px 20px",
                color: "#7c6852",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              등록된 게시글이 없습니다.
            </div>
          ) : (
            rows.map((item, index) => (
              <Link
                key={item.id}
                href={`/board/${item.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0, 1fr) 120px 140px",
                  padding: "18px 20px",
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom:
                    index === rows.length - 1 ? "none" : "1px solid #f0e6d9",
                  background: index % 2 === 0 ? "#fbf7f1" : "#fffdf9",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 68,
                      height: 32,
                      padding: "0 12px",
                      borderRadius: 999,
                      background:
                        item.status === "answered" ? "#e8f6ea" : "#f2e8db",
                      color:
                        item.status === "answered" ? "#3f8a53" : "#7f684f",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {item.status === "answered" ? "답변완료" : "접수"}
                  </span>
                </div>

                <div
                  style={{
                    color: "#16110d",
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 16,
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    color: "#6d5945",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {maskAuthor(item.user_id)}
                </div>

                <div
                  style={{
                    color: "#6d5945",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {formatDate(item.created_at)}
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}