import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  status?: string;
}>;

export default async function AdminAdInquiriesPage(props: {
  searchParams?: SearchParams;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const selectedStatus = searchParams.status || "all";

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/ad-inquiries");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  let query = supabase
    .from("ad_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data: inquiries, error } = await query;

  const safeInquiries = inquiries ?? [];

  const totalCount = safeInquiries.length;
  const newCount = safeInquiries.filter((item) => item.status === "new").length;
  const reviewingCount = safeInquiries.filter(
    (item) => item.status === "reviewing"
  ).length;
  const doneCount = safeInquiries.filter((item) => item.status === "done").length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f1e7",
        padding: "32px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfcf",
            borderRadius: 28,
            padding: "28px 22px",
            boxShadow: "0 18px 50px rgba(47,36,23,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#7b664e",
              letterSpacing: "0.08em",
            }}
          >
            ADMIN / AD INQUIRIES
          </div>

          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: 30,
              lineHeight: 1.15,
              letterSpacing: "-0.04em",
              color: "#2f2417",
            }}
          >
            광고 문의 확인
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.8,
              color: "#6f5c47",
            }}
          >
            광고문의, 상위고정노출 문의, 배너 광고 문의를 운영자가 한 곳에서
            확인할 수 있습니다.
          </p>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <KpiCard label="전체 문의" value={String(totalCount)} />
            <KpiCard label="신규" value={String(newCount)} />
            <KpiCard label="검토중" value={String(reviewingCount)} />
            <KpiCard label="처리완료" value={String(doneCount)} />
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <FilterLink href="/admin/ad-inquiries" active={selectedStatus === "all"}>
              전체
            </FilterLink>
            <FilterLink
              href="/admin/ad-inquiries?status=new"
              active={selectedStatus === "new"}
            >
              신규
            </FilterLink>
            <FilterLink
              href="/admin/ad-inquiries?status=reviewing"
              active={selectedStatus === "reviewing"}
            >
              검토중
            </FilterLink>
            <FilterLink
              href="/admin/ad-inquiries?status=done"
              active={selectedStatus === "done"}
            >
              완료
            </FilterLink>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          {error ? (
            <div
              style={{
                background: "#fff1ef",
                border: "1px solid #f2d2cc",
                borderRadius: 18,
                padding: 16,
                color: "#9a3426",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              문의 데이터를 불러오지 못했습니다: {error.message}
            </div>
          ) : null}

          {!error && safeInquiries.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eadfcf",
                borderRadius: 24,
                padding: 24,
                color: "#6f5c47",
                fontSize: 14,
              }}
            >
              현재 해당 조건의 광고 문의가 없습니다.
            </div>
          ) : null}

          {safeInquiries.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#ffffff",
                border: "1px solid #eadfcf",
                borderRadius: 24,
                padding: 20,
                display: "grid",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Badge>{formatInquiryType(item.inquiry_type)}</Badge>
                    <StatusBadge status={item.status} />
                  </div>

                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#2f2417",
                      lineHeight: 1.25,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "#7a6752",
                      lineHeight: 1.7,
                    }}
                  >
                    접수일: {formatDate(item.created_at)}
                  </div>
                </div>

                <form
                  action="/api/ad-inquiries/update-status"
                  method="post"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <select
                    name="status"
                    defaultValue={item.status}
                    style={smallInputStyle}
                  >
                    <option value="new">신규</option>
                    <option value="reviewing">검토중</option>
                    <option value="done">처리완료</option>
                    <option value="hold">보류</option>
                  </select>
                  <button type="submit" style={smallButtonStyle}>
                    상태 저장
                  </button>
                </form>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <InfoBox label="회사명 / 브랜드명" value={item.company_name} />
                <InfoBox label="담당자명" value={item.contact_name} />
                <InfoBox label="이메일" value={item.email} />
                <InfoBox label="휴대폰" value={item.phone_number} />
                <InfoBox label="카카오 ID" value={item.kakao_id} />
                <InfoBox label="텔레그램 ID" value={item.telegram_id} />
                <InfoBox label="예산" value={item.budget} />
                <InfoBox label="희망 노출 영역" value={item.target_service} />
              </div>

              <div
                style={{
                  background: "#fcfaf6",
                  border: "1px solid #eee2d2",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#7b664e",
                    marginBottom: 8,
                  }}
                >
                  문의 내용
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#2f2417",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {item.body}
                </div>
              </div>

              <form
                action="/api/ad-inquiries/update-status"
                method="post"
                style={{
                  display: "grid",
                  gap: 10,
                }}
              >
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="status" value={item.status} />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#7b664e",
                  }}
                >
                  관리자 메모
                </div>
                <textarea
                  name="admin_memo"
                  defaultValue={item.admin_memo ?? ""}
                  placeholder="운영 메모를 남겨두세요."
                  style={{
                    width: "100%",
                    minHeight: 110,
                    borderRadius: 16,
                    border: "1px solid #dccbb3",
                    background: "#fffdf9",
                    padding: 14,
                    fontSize: 14,
                    color: "#2f2417",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                <div>
                  <button type="submit" style={smallButtonStyle}>
                    메모 저장
                  </button>
                </div>
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fcfaf6",
        border: "1px solid #eadfcf",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#7b664e",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#2f2417",
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        padding: "0 14px",
        borderRadius: 999,
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 800,
        background: active ? "#2f2417" : "#eadfcf",
        color: active ? "#ffffff" : "#2f2417",
        border: active ? "none" : "1px solid #dccbb3",
      }}
    >
      {children}
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        padding: "0 10px",
        borderRadius: 999,
        background: "#f4ede2",
        color: "#6b5640",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "new"
      ? "신규"
      : status === "reviewing"
      ? "검토중"
      : status === "done"
      ? "처리완료"
      : status === "hold"
      ? "보류"
      : status;

  return <Badge>{label}</Badge>;
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div
      style={{
        background: "#fcfaf6",
        border: "1px solid #eee2d2",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#7b664e",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#2f2417",
          wordBreak: "break-word",
        }}
      >
        {value && value.trim() ? value : "-"}
      </div>
    </div>
  );
}

function formatInquiryType(type: string) {
  if (type === "top_fixed") return "상위 고정 노출";
  if (type === "banner") return "배너 광고";
  if (type === "partnership") return "제휴 / 협업";
  return "일반 광고 문의";
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const smallInputStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 12,
  border: "1px solid #dccbb3",
  background: "#fffdf9",
  padding: "0 12px",
  fontSize: 13,
  color: "#2f2417",
};

const smallButtonStyle: React.CSSProperties = {
  height: 40,
  padding: "0 14px",
  borderRadius: 12,
  border: "none",
  background: "#2f2417",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};