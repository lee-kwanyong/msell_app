import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryDropdown from "@/components/listings/CategoryDropdown";

type CategoryRow = {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  label?: string | null;
  image_url?: string | null;
  icon_url?: string | null;
  thumbnail_url?: string | null;
};

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/listings/create");
  }

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = Array.isArray(categoriesRaw)
    ? (categoriesRaw as CategoryRow[]).map((category) => ({
        id: String(category.id),
        value: String(
          category.slug ?? category.name ?? category.label ?? category.id
        ),
        label:
          category.name ??
          category.label ??
          category.slug ??
          String(category.id),
        image:
          category.image_url ??
          category.icon_url ??
          category.thumbnail_url ??
          null,
      }))
    : [];

  const params = searchParams ? await searchParams : undefined;
  const error = params?.error ?? "";
  const success = params?.success ?? "";

  const statusOptions = [
    { value: "active", label: "거래가능" },
    { value: "hidden", label: "숨김" },
    { value: "draft", label: "임시저장" },
    { value: "sold", label: "거래종료" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "40px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "#5b4632",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ← 목록으로
          </Link>
        </div>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(47, 36, 23, 0.08)",
            border: "1px solid #eee4d6",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#8a6f52",
                marginBottom: 8,
              }}
            >
              LISTING CREATE
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.2,
                color: "#241b11",
                fontWeight: 800,
              }}
            >
              새 매물 등록
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#6a5743",
              }}
            >
              제목, 카테고리, 가격, 이전 방식, 설명, 상태를 입력해서 등록하세요.
            </p>
          </div>

          {error ? (
            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 14,
                background: "#fff4f2",
                border: "1px solid #f1d0c8",
                color: "#9a3f2d",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {decodeURIComponent(error)}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 14,
                background: "#f4fbf4",
                border: "1px solid #d5ead5",
                color: "#2f6b3d",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {decodeURIComponent(success)}
            </div>
          ) : null}

          <form
            action="/api/listings/create"
            method="post"
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div
              className="msell-create-grid"
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <Field label="제목" required>
                <input
                  type="text"
                  name="title"
                  placeholder="예: 인스타 계정 양도 / 유튜브 채널 매각"
                  required
                  maxLength={120}
                  style={inputStyle}
                />
              </Field>

              <Field label="카테고리" required>
                <CategoryDropdown
                  name="category"
                  items={categories}
                  placeholder="카테고리를 선택하세요"
                  required
                />
              </Field>

              <Field label="희망 가격" required>
                <input
                  type="number"
                  name="price"
                  placeholder="예: 1500000"
                  required
                  min={0}
                  step="1"
                  style={inputStyle}
                />
              </Field>

              <Field label="상태" required>
                <select
                  name="status"
                  required
                  defaultValue="active"
                  style={inputStyle}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="이전 방식"
              description="예: 계정 이메일 전체 이전 / 관리자 권한 이전 / 지갑 직접 전송"
              required
            >
              <input
                type="text"
                name="transfer_method"
                placeholder="이전 방식을 입력하세요"
                required
                maxLength={200}
                style={inputStyle}
              />
            </Field>

            <Field
              label="설명"
              description="거래 대상, 상태, 포함 항목, 유의사항 등을 자세히 적어주세요."
              required
            >
              <textarea
                name="description"
                placeholder="예: 수익 구조, 운영 기간, 포함 자산, 주의사항 등을 작성하세요."
                required
                rows={10}
                style={{
                  ...inputStyle,
                  height: "auto",
                  minHeight: 220,
                  paddingTop: 14,
                  paddingBottom: 14,
                  resize: "vertical",
                }}
              />
            </Field>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              <button
                type="submit"
                style={{
                  border: "none",
                  borderRadius: 14,
                  background: "#2f2417",
                  color: "#ffffff",
                  height: 52,
                  padding: "0 22px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                매물 등록하기
              </button>

              <Link
                href="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  borderRadius: 14,
                  background: "#eadfcf",
                  color: "#2f2417",
                  height: 52,
                  padding: "0 22px",
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                취소
              </Link>
            </div>
          </form>
        </section>
      </div>

      <style>
        {`
          @media (max-width: 760px) {
            .msell-create-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </main>
  );
}

function Field({
  label,
  required,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#2f2417",
          }}
        >
          {label}
        </span>
        {required ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#a05a2c",
            }}
          >
            필수
          </span>
        ) : null}
      </div>

      {description ? (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: "#7a6753",
          }}
        >
          {description}
        </p>
      ) : null}

      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid #ddcfba",
  background: "#fffdf9",
  padding: "0 14px",
  fontSize: 15,
  color: "#241b11",
  outline: "none",
  boxSizing: "border-box",
};