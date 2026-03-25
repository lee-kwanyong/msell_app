import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR").format(Number(value ?? 0));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "판매중";
    case "hidden":
      return "숨김";
    case "sold":
      return "판매완료";
    case "closed":
      return "종료";
    default:
      return status || "판매중";
  }
}

function isClosedStatus(status?: string | null) {
  return status === "hidden" || status === "sold" || status === "closed";
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, user_id, title, category, price, description, status, created_at")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const isOwner = !!user && listing.user_id === user.id;
  const closed = isClosedStatus(listing.status);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        background: "#f6f1e7",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 22 }}>
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#9a866f",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Listing
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 48,
                lineHeight: 1.08,
                color: "#2f2417",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              {listing.title || "제목 없음"}
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#7a6856",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              디지털 자산 매물 상세 정보와 거래 진입 버튼을 한 화면에서 확인할 수 있습니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/listings"
              style={{
                height: 46,
                padding: "0 18px",
                borderRadius: 16,
                background: "#eadfcf",
                color: "#2f2417",
                textDecoration: "none",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              목록으로
            </Link>

            {isOwner ? (
              <Link
                href={`/listings/${listing.id}/edit`}
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 16,
                  background: "#2f2417",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                매물 수정
              </Link>
            ) : user ? (
              <form method="post" action="/api/deals/create">
                <input type="hidden" name="listing_id" value={listing.id} />
                <button
                  type="submit"
                  disabled={closed}
                  style={{
                    height: 46,
                    padding: "0 18px",
                    borderRadius: 16,
                    border: "none",
                    background: closed ? "#cabca8" : "#2f2417",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: closed ? "not-allowed" : "pointer",
                  }}
                >
                  {closed ? "거래 불가" : "거래 문의 시작"}
                </button>
              </form>
            ) : (
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`}
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 16,
                  background: "#2f2417",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                로그인 후 문의
              </Link>
            )}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eadfcf",
              borderRadius: 30,
              padding: 24,
              boxShadow: "0 12px 32px rgba(47, 36, 23, 0.05)",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "#f2e7d7",
                  color: "#7e684f",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {listing.category || "미분류"}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: closed ? "#fff2ef" : "#f8f4ec",
                  color: closed ? "#b14a34" : "#8c7964",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {getStatusLabel(listing.status)}
              </span>
            </div>

            <div
              style={{
                fontSize: 54,
                lineHeight: 1.02,
                color: "#16110b",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                marginBottom: 20,
                wordBreak: "break-word",
              }}
            >
              {listing.title || "제목 없음"}
            </div>

            <div
              style={{
                background: "#f8f4ec",
                border: "1px solid #eadfcf",
                borderRadius: 22,
                padding: "20px 22px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#8c7964",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                매물 소개
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: "#2f2417",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {listing.description?.trim() || "설명이 아직 등록되지 않았습니다."}
              </div>
            </div>

            {!isOwner && user && !closed ? (
              <form method="post" action="/api/deals/create">
                <input type="hidden" name="listing_id" value={listing.id} />
                <button
                  type="submit"
                  style={{
                    height: 52,
                    width: "100%",
                    border: "none",
                    borderRadius: 18,
                    background: "#2f2417",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  거래 문의 시작
                </button>
              </form>
            ) : null}

            {!user ? (
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`}
                style={{
                  marginTop: 14,
                  height: 52,
                  width: "100%",
                  borderRadius: 18,
                  background: "#2f2417",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: 16,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                로그인 후 거래 문의
              </Link>
            ) : null}
          </div>

          <aside
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eadfcf",
                borderRadius: 30,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#8c7964",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                매물 가격
              </div>
              <div
                style={{
                  fontSize: 34,
                  color: "#2f2417",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {formatPrice(listing.price)}원
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eadfcf",
                borderRadius: 30,
                padding: 22,
                display: "grid",
                gap: 14,
              }}
            >
              <div
                style={{
                  background: "#f8f4ec",
                  border: "1px solid #eadfcf",
                  borderRadius: 20,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#8c7964",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  상태
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#2f2417",
                    fontWeight: 900,
                  }}
                >
                  {getStatusLabel(listing.status)}
                </div>
              </div>

              <div
                style={{
                  background: "#f8f4ec",
                  border: "1px solid #eadfcf",
                  borderRadius: 20,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#8c7964",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  등록일
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#2f2417",
                    fontWeight: 900,
                  }}
                >
                  {formatDate(listing.created_at)}
                </div>
              </div>

              <div
                style={{
                  background: "#f8f4ec",
                  border: "1px solid #eadfcf",
                  borderRadius: 20,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#8c7964",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  안내
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#6f604f",
                  }}
                >
                  거래 문의를 시작하면 기존 거래방이 있으면 재사용되고, 없으면 새 거래방이 생성됩니다.
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}