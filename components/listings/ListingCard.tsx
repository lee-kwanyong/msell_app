import Link from "next/link";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    category?: string | null;
    price?: number | null;
    status?: string | null;
    description?: string | null;
    created_at?: string | null;
  };
};

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "판매 중";
    case "hidden":
      return "숨김";
    case "sold":
      return "판매 완료";
    case "deleted":
      return "삭제";
    default:
      return "판매 중";
  }
}

function getStatusStyle(status?: string | null) {
  switch (status) {
    case "sold":
      return {
        background: "#edf8ef",
        color: "#1e6a2d",
        border: "1px solid #cfe7d5",
      };
    case "hidden":
      return {
        background: "#f3f1ed",
        color: "#6a6157",
        border: "1px solid #ddd4c8",
      };
    case "deleted":
      return {
        background: "#fff3f3",
        color: "#9d2525",
        border: "1px solid #f0caca",
      };
    default:
      return {
        background: "#fff8ea",
        color: "#8a6116",
        border: "1px solid #ecd9ad",
      };
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const statusStyle = getStatusStyle(listing.status);

  return (
    <Link
      href={`/listings/${listing.id}`}
      style={{
        textDecoration: "none",
        background: "#ffffff",
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
        display: "grid",
        gap: 14,
        color: "#241b11",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#241b11",
              lineHeight: 1.3,
              marginBottom: 8,
              wordBreak: "break-word",
            }}
          >
            {listing.title}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#8a7865",
            }}
          >
            {listing.category || "미분류"}
          </div>
        </div>

        <div
          style={{
            ...statusStyle,
            borderRadius: 999,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {getStatusLabel(listing.status)}
        </div>
      </div>

      <div
        style={{
          background: "#fbf8f3",
          borderRadius: 18,
          padding: 16,
          minHeight: 96,
          fontSize: 14,
          lineHeight: 1.7,
          color: "#4a3d31",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {listing.description || "설명이 없습니다."}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fbf8f3",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 6 }}>
            가격
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#241b11",
            }}
          >
            {typeof listing.price === "number"
              ? `${listing.price.toLocaleString()}원`
              : "협의"}
          </div>
        </div>

        <div
          style={{
            background: "#fbf8f3",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, color: "#8a7865", marginBottom: 6 }}>
            등록일
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#241b11",
            }}
          >
            {listing.created_at
              ? new Date(listing.created_at).toLocaleDateString("ko-KR")
              : "-"}
          </div>
        </div>
      </div>
    </Link>
  );
}