import Link from "next/link";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

type SearchParams = Promise<{
  error?: string;
  message?: string;
  title?: string;
  category?: string;
  price?: string;
  transfer_method?: string;
  description?: string;
  status?: string;
}>;

function decodeValue(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function field(inputStyle?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 16,
    border: "1px solid #d8c8b2",
    background: "#fffdf9",
    color: "#2f2417",
    fontSize: 15,
    fontWeight: 700,
    outline: "none",
    ...inputStyle,
  };
}

function cardStyle(): React.CSSProperties {
  return {
    background: "#f2eadf",
    border: "1px solid #dbcdb9",
    borderRadius: 28,
    padding: 18,
  };
}

function helperItemStyle(): React.CSSProperties {
  return {
    borderRadius: 18,
    border: "1px solid #d8c8b2",
    background: "#f7f2ea",
    padding: "16px 16px",
  };
}

function quickLinkStyle(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 18,
    border: "1px solid #d8c8b2",
    background: "#fffdf9",
    color: "#2f2417",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 900,
  };
}

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = (await searchParams) ?? {};

  const error = decodeValue(resolved.error || resolved.message);
  const defaultTitle = decodeValue(resolved.title);
  const defaultCategory = decodeValue(resolved.category);
  const defaultPrice = decodeValue(resolved.price);
  const defaultTransferMethod = decodeValue(resolved.transfer_method);
  const defaultDescription = decodeValue(resolved.description);
  const defaultStatus = decodeValue(resolved.status) || "active";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "28px 16px 120px",
      }}
    >
      <style>{`
        .create-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 20px;
          align-items: start;
        }

        .create-main {
          min-width: 0;
        }

        .create-side {
          min-width: 0;
          display: grid;
          gap: 16px;
          position: sticky;
          top: 96px;
        }

        .create-category-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .create-layout {
            grid-template-columns: 1fr;
          }

          .create-side {
            position: static;
            order: 2;
          }
        }

        @media (max-width: 640px) {
          .create-category-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#8a7156",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              LISTING CREATE
            </div>
            <h1
              style={{
                margin: 0,
                color: "#1f140c",
                fontSize: 34,
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              자산 등록
            </h1>
          </div>

          <Link
            href="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              padding: "0 18px",
              borderRadius: 999,
              background: "#fffdf9",
              border: "1px solid #d8c8b2",
              color: "#5e4a38",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            거래목록으로
          </Link>
        </div>

        {error ? (
          <div
            style={{
              borderRadius: 18,
              border: "1px solid #efc7c1",
              background: "#fff4f2",
              color: "#8b2f23",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="create-layout">
          <div className="create-main">
            <form
              action="/api/listings/create"
              method="post"
              style={{
                ...cardStyle(),
                display: "grid",
                gap: 16,
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="title"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#2f2417",
                  }}
                >
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={defaultTitle}
                  placeholder="예: 수익화 완료 유튜브 채널"
                  style={field({
                    height: 56,
                    padding: "0 16px",
                  })}
                />
              </div>

              <CategoryDropdown
                name="category"
                defaultValue={defaultCategory}
                required
                showCategoryLabel={true}
                showTypeLabel={true}
                inline
              />

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="price"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#2f2417",
                  }}
                >
                  희망 가격
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  required
                  defaultValue={defaultPrice}
                  placeholder="예: 1500000"
                  style={field({
                    height: 56,
                    padding: "0 16px",
                  })}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="transfer_method"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#2f2417",
                  }}
                >
                  이전 방식
                </label>
                <input
                  id="transfer_method"
                  name="transfer_method"
                  type="text"
                  required
                  defaultValue={defaultTransferMethod}
                  placeholder="예: 계정 이메일 양도 / 관리자 권한 이전 / 도메인 이전"
                  style={field({
                    height: 56,
                    padding: "0 16px",
                  })}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="description"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#2f2417",
                  }}
                >
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  defaultValue={defaultDescription}
                  placeholder="운영 기간, 수익 구조, 팔로워/구독자 상태, 인수인계 범위를 구체적으로 적어 주세요."
                  style={field({
                    minHeight: 180,
                    padding: "16px",
                    resize: "vertical",
                    lineHeight: 1.7,
                  })}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  htmlFor="status"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#2f2417",
                  }}
                >
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={defaultStatus}
                  style={field({
                    height: 56,
                    padding: "0 16px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  })}
                >
                  <option value="active">거래가능</option>
                  <option value="hidden">숨김</option>
                  <option value="draft">임시저장</option>
                  <option value="sold">거래종료</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  paddingTop: 4,
                }}
              >
                <Link
                  href="/listings"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 110,
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 999,
                    background: "#fffdf9",
                    border: "1px solid #d8c8b2",
                    color: "#5e4a38",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  취소
                </Link>

                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 130,
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 999,
                    border: "none",
                    background: "#2f2417",
                    color: "#fffaf2",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  자산 등록하기
                </button>
              </div>
            </form>
          </div>

          <aside className="create-side">
            <section style={cardStyle()}>
              <div
                style={{
                  color: "#1f140c",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                등록 가이드
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={helperItemStyle()}>
                  <div
                    style={{
                      color: "#2f2417",
                      fontSize: 14,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    제목
                  </div>
                  <div
                    style={{
                      color: "#6f5a46",
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontWeight: 700,
                    }}
                  >
                    자산의 핵심이 바로 보이도록 짧고 명확하게 작성
                  </div>
                </div>

                <div style={helperItemStyle()}>
                  <div
                    style={{
                      color: "#2f2417",
                      fontSize: 14,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    설명
                  </div>
                  <div
                    style={{
                      color: "#6f5a46",
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontWeight: 700,
                    }}
                  >
                    운영 이력, 수익 구조, 이전 범위를 중심으로 작성
                  </div>
                </div>

                <div style={helperItemStyle()}>
                  <div
                    style={{
                      color: "#2f2417",
                      fontSize: 14,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    가격
                  </div>
                  <div
                    style={{
                      color: "#6f5a46",
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontWeight: 700,
                    }}
                  >
                    실제 희망 거래가는 숫자로 입력
                  </div>
                </div>

                <div style={helperItemStyle()}>
                  <div
                    style={{
                      color: "#2f2417",
                      fontSize: 14,
                      fontWeight: 900,
                      marginBottom: 6,
                    }}
                  >
                    상태
                  </div>
                  <div
                    style={{
                      color: "#6f5a46",
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontWeight: 700,
                    }}
                  >
                    공개 판매는 거래가능, 보관은 임시저장 또는 숨김 사용
                  </div>
                </div>
              </div>
            </section>

            <section style={cardStyle()}>
              <div
                style={{
                  color: "#1f140c",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                빠른 이동
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <Link href="/listings" style={quickLinkStyle()}>
                  거래목록
                </Link>
                <Link href="/my/listings" style={quickLinkStyle()}>
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