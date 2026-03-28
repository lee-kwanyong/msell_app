import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  error?: string;
  title?: string;
  content?: string;
}>;

function decodeValue(value?: string) {
  return value ? decodeURIComponent(value) : "";
}

export default async function BoardCreatePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/board/create");
  }

  const error = decodeValue(query?.error);
  const title = decodeValue(query?.title);
  const content = decodeValue(query?.content);

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
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
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
            WRITE POST
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 48,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            게시글 작성
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
            문의나 요청 사항을 등록하면 관리자가 답변할 수 있습니다.
          </p>
        </section>

        <section
          style={{
            marginTop: 24,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 30,
            padding: 24,
            boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
          }}
        >
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

          <form method="post" action="/api/board/create">
            <div style={{ display: "grid", gap: 16 }}>
              <label style={{ display: "block" }}>
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#7f684f",
                  }}
                >
                  제목
                </div>
                <input
                  type="text"
                  name="title"
                  defaultValue={title}
                  required
                  placeholder="제목을 입력하세요"
                  style={{
                    width: "100%",
                    height: 60,
                    borderRadius: 18,
                    border: "1px solid #eadfcf",
                    background: "#fffdf9",
                    padding: "0 18px",
                    color: "#24190f",
                    fontSize: 16,
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#7f684f",
                  }}
                >
                  내용
                </div>
                <textarea
                  name="content"
                  defaultValue={content}
                  required
                  rows={12}
                  placeholder="내용을 입력하세요"
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
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <Link
                  href="/board"
                  style={{
                    height: 54,
                    padding: "0 18px",
                    borderRadius: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    background: "#fffdf9",
                    border: "1px solid #eadfcf",
                    color: "#2f2417",
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  취소
                </Link>

                <button
                  type="submit"
                  style={{
                    minWidth: 180,
                    height: 54,
                    borderRadius: 18,
                    border: 0,
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  등록하기
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}