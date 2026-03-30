import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CategoryDropdown from "@/components/listings/CategoryDropdown";
import DeleteListingButton from "@/components/listings/DeleteListingButton";
import { supabaseServer } from "@/lib/supabase/server";

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

function parseTransferMethod(description?: string | null) {
  if (!description) return "";
  const match = description.match(/^\[이전 방식\]\s*(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

function parseBodyDescription(description?: string | null) {
  if (!description) return "";
  return description.replace(/^\[이전 방식\]\s*.+\n\n?/m, "").trim();
}

function radioCardStyle(selected: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    padding: "0 16px",
    borderRadius: 16,
    border: `1px solid ${selected ? "#2f2417" : "#d8c8b2"}`,
    background: selected ? "#f7efe4" : "#fffdf9",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    color: "#2f2417",
  };
}

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorMessage = resolvedSearchParams.error
    ? decodeURIComponent(resolvedSearchParams.error)
    : "";

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/listings/${id}/edit`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  if (listing.seller_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  const transferMethod = parseTransferMethod(listing.description);
  const bodyDescription = parseBodyDescription(listing.description);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "28px 16px 120px",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .edit-price-row {
            grid-template-columns: 1fr !important;
          }

          .edit-bottom-row {
            grid-template-columns: 1fr !important;
          }

          .edit-right-actions {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 860,
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
              LISTING EDIT
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
              자산 수정
            </h1>
          </div>

          <Link
            href={`/listings/${id}`}
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
            상세로 돌아가기
          </Link>
        </div>

        {errorMessage ? (
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
            {errorMessage}
          </div>
        ) : null}

        <form
          action="/api/listings/update"
          method="post"
          style={{
            display: "grid",
            gap: 16,
            background: "#f2eadf",
            border: "1px solid #dbcdb9",
            borderRadius: 28,
            padding: 18,
          }}
        >
          <input type="hidden" name="id" value={listing.id} />

          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="title" style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}>
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={listing.title ?? ""}
              style={field({ height: 56, padding: "0 16px" })}
            />
          </div>

          <CategoryDropdown
            name="category"
            defaultValue={listing.category ?? listing.listing_type ?? ""}
            required
            showCategoryLabel={true}
            showTypeLabel={true}
            inline
          />

          <div
            className="edit-price-row"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 260px",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="price" style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}>
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
                defaultValue={listing.price ?? ""}
                style={field({ height: 56, padding: "0 16px" })}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}>금액 협의</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={radioCardStyle(Boolean(listing.price_negotiable))}>
                  <input
                    type="radio"
                    name="price_negotiable"
                    value="true"
                    defaultChecked={Boolean(listing.price_negotiable)}
                    style={{ margin: 0 }}
                  />
                  가능
                </label>

                <label style={radioCardStyle(!Boolean(listing.price_negotiable))}>
                  <input
                    type="radio"
                    name="price_negotiable"
                    value="false"
                    defaultChecked={!Boolean(listing.price_negotiable)}
                    style={{ margin: 0 }}
                  />
                  불가능
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label
              htmlFor="transfer_method"
              style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}
            >
              이전 방식
            </label>
            <input
              id="transfer_method"
              name="transfer_method"
              type="text"
              required
              defaultValue={transferMethod}
              style={field({ height: 56, padding: "0 16px" })}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label
              htmlFor="description"
              style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}
            >
              설명
            </label>
            <textarea
              id="description"
              name="description"
              required
              defaultValue={bodyDescription}
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
              style={{ fontSize: 14, fontWeight: 900, color: "#2f2417" }}
            >
              상태
            </label>
            <select
              id="status"
              name="status"
              defaultValue={listing.status ?? "active"}
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
              <option value="reserved">예약중</option>
            </select>
          </div>

          <div
            className="edit-bottom-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 10,
              alignItems: "center",
              paddingTop: 4,
            }}
          >
            <div>
              <form action="/api/listings/delete" method="post">
                <input type="hidden" name="listing_id" value={listing.id} />
                <DeleteListingButton label="글 삭제" />
              </form>
            </div>

            <div
              className="edit-right-actions"
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto",
                gap: 10,
              }}
            >
              <Link
                href={`/listings/${id}`}
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
                수정 저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}