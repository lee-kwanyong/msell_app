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
    reply?: string;
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

export default async function BoardDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const error = decodeValue(query?.error);
  const success = decodeValue(query?.success);
  const replyDraft = decodeValue(query?.reply);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (postError || !post) {
    redirect("/board");
  }

  const { data: replies } = await supabase
    .from("board_replies")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  const replyRows = replies ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 20px 96px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            color: "#8a7156",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Link href="/board" style={{ color: "#8a7156", textDecoration: "none" }}>
            ← 게시판 목록
          </Link>
        </div>

        {error ? (
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
            }}
          >
            {error}
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

        <section
          style={{
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 30,
            padding: 24,
            boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 72,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 999,
                  background:
                    post.status === "answered" ? "#e8f6ea" : "#f2e8db",
                  color:
                    post.status === "answered" ? "#3f8a53" : "#7f684f",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 12,
                }}
              >
                {post.status === "answered" ? "답변완료" : "접수"}
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#16110d",
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.12,
                }}
              >
                {post.title}
              </h1>
            </div>

            <div
              style={{
                color: "#8a7156",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              작성일 {formatDateTime(post.created_at)}
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              background: "#fffdf9",
              border: "1px solid #eadfcf",
              padding: 20,
              color: "#24190f",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {post.content}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 30,
            padding: 24,
            boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
          }}
        >
          <div
            style={{
              color: "#16110d",
              fontSize: 22,
              fontWeight: 900,
              marginBottom: 16,
            }}
          >
            관리자 답변
          </div>

          {replyRows.length === 0 ? (
            <div
              style={{
                borderRadius: 20,
                border: "1px dashed #eadfcf",
                background: "#fffdf9",
                padding: "18px 16px",
                color: "#8a7156",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              아직 등록된 답변이 없습니다.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {replyRows.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 22,
                    background: "#fffdf9",
                    border: "1px solid #eadfcf",
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        color: "#16110d",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      관리자 답변
                    </div>

                    <div
                      style={{
                        color: "#8a7156",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {formatDateTime(item.created_at)}
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#24190f",
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin ? (
            <form method="post" action="/api/board/replies/create" style={{ marginTop: 18 }}>
              <input type="hidden" name="post_id" value={id} />
              <textarea
                name="content"
                defaultValue={replyDraft}
                placeholder="관리자 답변을 입력하세요"
                rows={6}
                style={{
                  width: "100%",
                  borderRadius: 20,
                  border: "1px solid #eadfcf",
                  background: "#fffdf9",
                  padding: "16px 18px",
                  color: "#24190f",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.7,
                }}
              />
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
                    minWidth: 180,
                    height: 52,
                    borderRadius: 18,
                    border: 0,
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  답변 등록
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </main>
  );
}