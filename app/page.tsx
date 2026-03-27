import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  price: number | null;
  status: string | null;
  created_at: string | null;
};

function priceLabel(price?: number | null) {
  if (typeof price !== "number" || Number.isNaN(price)) return "-";
  return `₩ ${price.toLocaleString("ko-KR")}`;
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, category, price, status, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  const activeListings = (listings ?? []) as ListingRow[];
  const totalActive = activeListings.length;
  const totalAmount = activeListings.reduce(
    (sum, item) => sum + (typeof item.price === "number" ? item.price : 0),
    0
  );

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
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.95fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <section
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 34,
              padding: 28,
              boxShadow: "0 18px 40px rgba(61, 41, 22, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: "#a58a6d",
                marginBottom: 14,
              }}
            >
              MSELL
            </div>

            <h1
              style={{
                margin: 0,
                color: "#16110d",
                fontSize: 66,
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                fontWeight: 900,
              }}
            >
              디지털 자산
              <br />
              마켓플레이스
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                maxWidth: 620,
                color: "#6d5945",
                fontSize: 16,
                lineHeight: 1.75,
                fontWeight: 600,
              }}
            >
              계정, 채널, 도메인, 커뮤니티, 디지털 상품 등 거래 가능한 자산을
              간결하게 등록하고 바로 문의까지 연결할 수 있습니다.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <Link
                href="/listings"
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: "0 10px 22px rgba(47, 36, 23, 0.18)",
                }}
              >
                자산목록
              </Link>

              <Link
                href="/listings/create"
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#fffdf9",
                  color: "#2f2417",
                  border: "1px solid #e1d4c3",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                자산등록
              </Link>
            </div>

            <div
              style={{
                marginTop: 26,
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 24,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    color: "#aa9074",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  현재 공개 자산
                </div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {totalActive}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    color: "#aa9074",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  공개 금액 합계
                </div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  ₩ {totalAmount.toLocaleString("ko-KR")}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: "#fffdf9",
                  border: "1px solid #eadfcf",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    color: "#aa9074",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  최근 등록 자산
                </div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {activeListings.length}
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              background: "#fbf7f1",
              border: "1px solid #eadfce",
              borderRadius: 34,
              padding: 20,
              boxShadow: "0 18px 40px rgba(61, 41, 22, 0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.16em",
                    color: "#a58a6d",
                    marginBottom: 8,
                  }}
                >
                  AMOUNT TREND
                </div>
                <div
                  style={{
                    color: "#16110d",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  거래금액 추이
                </div>
              </div>

              <div
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f2e9dd",
                  color: "#8a7156",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                최근 7일
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 240,
                borderRadius: 26,
                background: "#fffdf9",
                border: "1px solid #eadfcf",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
              }}
            >
              <div
                style={{
                  height: 150,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                {[54, 88, 46, 96, 64, 118, 82].map((height, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "end",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 32,
                        height,
                        borderRadius: 999,
                        background:
                          "linear-gradient(180deg, #c7a27a 0%, #7b4f28 100%)",
                        boxShadow: "0 8px 20px rgba(91, 57, 27, 0.15)",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 10,
                }}
              >
                {["3/21", "3/22", "3/23", "3/24", "3/25", "3/26", "3/27"].map(
                  (date) => (
                    <div
                      key={date}
                      style={{
                        textAlign: "center",
                        color: "#9b8367",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {date}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </div>

        <section
          style={{
            marginTop: 24,
            background: "#fbf7f1",
            border: "1px solid #eadfce",
            borderRadius: 34,
            padding: 22,
            boxShadow: "0 18px 40px rgba(61, 41, 22, 0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
              gap: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                background: "#fffdf9",
                border: "1px solid #eadfcf",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  color: "#a58a6d",
                  marginBottom: 8,
                }}
              >
                POLICY
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#16110d",
                  marginBottom: 10,
                }}
              >
                운영 방침
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "#6e5946",
                  fontSize: 14,
                  lineHeight: 1.9,
                  fontWeight: 600,
                }}
              >
                <li>등록 정보는 간결하고 확인 가능한 항목 중심으로 노출</li>
                <li>거래 시작 전 조건과 이전 범위를 반드시 확인</li>
                <li>허위 매물, 중복 등록, 불분명한 정보는 운영 기준에 따라 조정</li>
                <li>문의 이후 진행은 당사자 간 협의를 기준으로 이어짐</li>
              </ul>
            </div>

            <div
              style={{
                borderRadius: 24,
                background: "#fffdf9",
                border: "1px solid #eadfcf",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  color: "#a58a6d",
                  marginBottom: 8,
                }}
              >
                TRADE FLOW
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#16110d",
                  marginBottom: 16,
                }}
              >
                거래 진행 4단계
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { no: "01", title: "매물 확인" },
                  { no: "02", title: "거래 문의" },
                  { no: "03", title: "조건 협의" },
                  { no: "04", title: "이전 완료" },
                ].map((item) => (
                  <div
                    key={item.no}
                    style={{
                      borderRadius: 20,
                      background: "#f8f1e7",
                      border: "1px solid #eadfcf",
                      padding: "16px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#aa9074",
                        fontWeight: 900,
                        marginBottom: 18,
                      }}
                    >
                      {item.no}
                    </div>
                    <div
                      style={{
                        color: "#16110d",
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  color: "#a58a6d",
                  marginBottom: 6,
                }}
              >
                LIVE LISTINGS
              </div>
              <h2
                style={{
                  margin: 0,
                  color: "#16110d",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                최신 등록 자산
              </h2>
            </div>

            <Link
              href="/listings"
              style={{
                height: 40,
                padding: "0 14px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#fffdf9",
                border: "1px solid #e1d4c3",
                color: "#2f2417",
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              전체 자산 보기
            </Link>
          </div>

          {activeListings.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {activeListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <article
                    style={{
                      height: "100%",
                      borderRadius: 28,
                      background: "#fbf7f1",
                      border: "1px solid #eadfce",
                      padding: 20,
                      boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 32,
                        padding: "0 12px",
                        borderRadius: 999,
                        background: "#f2e8db",
                        color: "#7f684f",
                        fontSize: 12,
                        fontWeight: 800,
                        marginBottom: 16,
                      }}
                    >
                      {item.category || "기타"}
                    </div>

                    <div
                      style={{
                        color: "#16110d",
                        fontSize: 22,
                        fontWeight: 900,
                        lineHeight: 1.2,
                        letterSpacing: "-0.03em",
                        minHeight: 54,
                      }}
                    >
                      {item.title || "제목 없음"}
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        color: "#2f2417",
                        fontSize: 26,
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {priceLabel(item.price)}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        color: "#8a7156",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      상태: {item.status || "-"}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                borderRadius: 30,
                background: "#fbf7f1",
                border: "1px solid #eadfce",
                padding: "50px 24px",
                textAlign: "center",
                boxShadow: "0 14px 34px rgba(61, 41, 22, 0.06)",
              }}
            >
              <div
                style={{
                  color: "#16110d",
                  fontSize: 28,
                  fontWeight: 900,
                  marginBottom: 10,
                  letterSpacing: "-0.03em",
                }}
              >
                등록된 자산이 없습니다
              </div>
              <div
                style={{
                  color: "#7c6852",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.7,
                  marginBottom: 22,
                }}
              >
                첫 자산을 등록하고 거래 흐름을 시작하세요.
              </div>
              <Link
                href="/listings/create"
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  background: "#2f2417",
                  color: "#fffaf2",
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: "0 10px 22px rgba(47, 36, 23, 0.18)",
                }}
              >
                자산등록
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}