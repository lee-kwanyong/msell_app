import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

type SearchParams = Promise<{
  error?: string;
}>;

const CATEGORY_OPTIONS = [
  "유튜브 채널",
  "인스타그램 계정",
  "틱톡 계정",
  "블로그",
  "카페",
  "도메인",
  "웹사이트",
  "쇼핑몰",
  "앱",
  "전자책",
  "강의",
  "커뮤니티",
  "뉴스레터",
  "디지털 상품",
  "기타",
];

const STATUS_OPTIONS = [
  { value: "active", label: "거래가능" },
  { value: "draft", label: "임시저장" },
  { value: "hidden", label: "숨김" },
  { value: "sold", label: "거래종료" },
];

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : "";

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/listings/create");
  }

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
            CREATE LISTING
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
            <div style={{ maxWidth: 720 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                자산 등록
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
                자산 제목, 카테고리, 가격, 이전 방식, 설명만 정확하게 입력하면
                바로 거래 화면으로 연결할 수 있습니다.
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
                href="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fffaf2",
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                목록으로
              </Link>

              <Link
                href="/my/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#2f2417",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#f3e6d3",
                }}
              >
                내 자산으로 이동
              </Link>
            </div>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.78fr)",
            gap: 24,
            marginTop: 24,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 32,
              padding: 22,
              boxShadow: "0 18px 44px rgba(61, 41, 22, 0.06)",
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
                  wordBreak: "break-word",
                }}
              >
                {error}
              </div>
            ) : null}

            <form method="post" action="/api/listings/create">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <label
                  style={{
                    display: "block",
                    gridColumn: "1 / -1",
                  }}
                >
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
                    placeholder="예: 팔로워10만"
                    required
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
                    카테고리
                  </div>
                  <CategoryDropdown
                    name="category"
                    defaultValue=""
                    categories={CATEGORY_OPTIONS}
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
                    희망 가격
                  </div>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    placeholder="예: 1500000"
                    required
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

                <label
                  style={{
                    display: "block",
                    gridColumn: "1 / -1",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#7f684f",
                    }}
                  >
                    이전 방식
                  </div>
                  <input
                    type="text"
                    name="transfer_method"
                    placeholder="예: 계정 이메일 양도 / 관리자 권한 이전 / 도메인 이전"
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

                <label
                  style={{
                    display: "block",
                    gridColumn: "1 / -1",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#7f684f",
                    }}
                  >
                    설명
                  </div>
                  <textarea
                    name="description"
                    placeholder="운영 기간, 수익 구조, 팔로워/구독자 상태, 인수인계 범위를 구체적으로 적어 주세요."
                    rows={11}
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

                <label style={{ display: "block" }}>
                  <div
                    style={{
                      marginBottom: 8,
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#7f684f",
                    }}
                  >
                    상태
                  </div>
                  <select
                    name="status"
                    defaultValue="active"
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
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      maxWidth: 240,
                      height: 60,
                      borderRadius: 18,
                      border: 0,
                      background: "#2f2417",
                      color: "#fffaf2",
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 12px 26px rgba(47, 36, 23, 0.2)",
                    }}
                  >
                    등록하기
                  </button>
                </div>
              </div>
            </form>
          </section>

          <aside
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <section
              style={{
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#2f2417",
                  marginBottom: 14,
                }}
              >
                등록 가이드
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {[
                  {
                    title: "제목",
                    body: "자산의 핵심이 바로 보이도록 짧고 명확하게 작성",
                  },
                  {
                    title: "설명",
                    body: "운영 이력, 수익 구조, 이전 범위를 중심으로 작성",
                  },
                  {
                    title: "가격",
                    body: "실제 희망 거래가를 숫자로 입력",
                  },
                  {
                    title: "상태",
                    body: "공개 판매는 거래가능, 보관은 임시저장 또는 숨김 사용",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      borderRadius: 18,
                      background: "#fffdf9",
                      border: "1px solid #eadfcf",
                      padding: "14px 14px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "#2f2417",
                        marginBottom: 6,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "#6f5b46",
                        fontWeight: 600,
                      }}
                    >
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 14px 36px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#2f2417",
                  marginBottom: 14,
                }}
              >
                빠른 이동
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <Link
                  href="/listings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 54,
                    borderRadius: 18,
                    background: "#fffdf9",
                    border: "1px solid #eadfcf",
                    color: "#2f2417",
                    fontSize: 15,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  거래목록
                </Link>

                <Link
                  href="/my/listings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 54,
                    borderRadius: 18,
                    background: "#fffdf9",
                    border: "1px solid #eadfcf",
                    color: "#2f2417",
                    fontSize: 15,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  내 매물
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}