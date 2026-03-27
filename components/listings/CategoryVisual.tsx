"use client";

type CategoryVisualMode = "light" | "dark" | "ghost";

export const CATEGORY_LABEL: Record<string, string> = {
  instagram: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
  x: "X",
  thread: "스레드",
  website: "웹사이트",
  ecommerce: "쇼핑몰",
  blog: "블로그",
  community: "커뮤니티",
  digital_product: "디지털상품",
  domain: "도메인",
  app: "앱",
  etc: "기타",
  facebook: "페이스북",
  naver_blog: "네이버 블로그",
  naver_cafe: "네이버 카페",
  telegram: "텔레그램",
  discord: "디스코드",
  kakao_channel: "카카오채널",
  newsletter: "뉴스레터",
  membership: "멤버십",
  saas: "SaaS",
  automation: "자동화자산",
  template: "템플릿",
  course: "강의/교육상품",
  marketplace: "마켓플레이스",
  media: "미디어자산",
  account: "계정형 자산",
  lead_db: "리드DB",
};

export function getCategoryLabel(category: string | null | undefined) {
  if (!category) return "기타";
  return CATEGORY_LABEL[category] || category;
}

export function CategoryIcon({
  value,
  size = 16,
}: {
  value: string | null | undefined;
  size?: number;
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 18 18",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (value) {
    case "instagram":
      return (
        <svg {...commonProps}>
          <rect x="2" y="2" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="9" r="3.1" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="13.1" cy="4.9" r="0.9" fill="currentColor" />
        </svg>
      );

    case "youtube":
      return (
        <svg {...commonProps}>
          <rect x="2" y="4" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.2 6.8L11.6 9L7.2 11.2V6.8Z" fill="currentColor" />
        </svg>
      );

    case "tiktok":
      return (
        <svg {...commonProps}>
          <path
            d="M10.7 3V10.2C10.7 12.1 9.2 13.6 7.3 13.6C5.7 13.6 4.4 12.3 4.4 10.7C4.4 9.1 5.7 7.8 7.3 7.8C7.7 7.8 8.1 7.9 8.5 8V6.2C8.1 6.1 7.7 6.1 7.3 6.1C4.8 6.1 2.8 8.1 2.8 10.7C2.8 13.2 4.8 15.2 7.3 15.2C9.9 15.2 11.9 13.2 11.9 10.7V6.6C12.8 7.2 13.9 7.5 15 7.5V5.9C13.4 5.9 12 4.6 11.7 3H10.7Z"
            fill="currentColor"
          />
        </svg>
      );

    case "x":
      return (
        <svg {...commonProps}>
          <path
            d="M4 3H6.8L9.3 6.7L12.2 3H14L10.2 7.8L14.3 15H11.5L8.7 10.9L5.4 15H3.6L7.8 9.8L4 3Z"
            fill="currentColor"
          />
        </svg>
      );

    case "thread":
      return (
        <svg {...commonProps}>
          <path
            d="M9.3 15.2C5.6 15.2 3.3 13.1 3.3 9.2C3.3 5.2 5.8 2.8 9.3 2.8C12.5 2.8 14.8 4.7 14.8 7.7C14.8 10.1 13.2 11.6 11.3 11.6C10.5 11.6 9.9 11.3 9.6 10.7C9.1 11.3 8.3 11.6 7.4 11.6C5.9 11.6 4.9 10.6 4.9 9.1C4.9 7.4 6.3 6.2 8.2 6.2C9.3 6.2 10.2 6.5 10.8 7.1V6.9C10.8 5.6 9.9 4.8 8.4 4.8C7.1 4.8 6.1 5.3 5.4 6.1L4.4 5.1C5.4 3.9 6.8 3.2 8.6 3.2C11.4 3.2 12.8 4.8 12.8 7.2V9.1C12.8 9.9 13.2 10.2 13.7 10.2C14.5 10.2 15 9.4 15 8C15 4.7 12.5 2.1 9.2 2.1C5.1 2.1 2.1 5 2.1 9.2C2.1 13.3 5 16.1 9.3 16.1C11.2 16.1 12.8 15.6 14.1 14.6L15 15.8C13.5 17 11.6 17.6 9.3 17.6"
            fill="currentColor"
          />
        </svg>
      );

    case "website":
      return (
        <svg {...commonProps}>
          <rect x="2" y="3" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2.8 6.1H15.2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="4.7" cy="4.6" r="0.7" fill="currentColor" />
          <circle cx="6.9" cy="4.6" r="0.7" fill="currentColor" />
        </svg>
      );

    case "ecommerce":
    case "marketplace":
      return (
        <svg {...commonProps}>
          <path d="M4.2 6.2H13.8L13 13.5H5L4.2 6.2Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.6 7V5.9C6.6 4.6 7.6 3.6 8.9 3.6C10.2 3.6 11.2 4.6 11.2 5.9V7" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    case "blog":
    case "newsletter":
      return (
        <svg {...commonProps}>
          <rect x="3" y="2.8" width="12" height="12.4" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.4 6H12.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.4 8.8H12.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.4 11.6H10.1" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    case "community":
    case "membership":
      return (
        <svg {...commonProps}>
          <circle cx="6.3" cy="7.1" r="2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="11.7" cy="7.1" r="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.7 13.8C4.3 12.2 5.7 11.2 7.3 11.2C8.9 11.2 10.3 12.2 10.9 13.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.1 13.8C9.6 12.8 10.5 12.1 11.8 12.1C13 12.1 14 12.8 14.4 13.8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    case "digital_product":
    case "template":
    case "course":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.1 9H11.9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 6.1V11.9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    case "domain":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="9" r="6.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2.8 9H15.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 2.8C10.6 4.4 11.5 6.6 11.5 9C11.5 11.4 10.6 13.6 9 15.2C7.4 13.6 6.5 11.4 6.5 9C6.5 6.6 7.4 4.4 9 2.8Z" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );

    case "app":
    case "saas":
    case "automation":
      return (
        <svg {...commonProps}>
          <rect x="4.2" y="2.6" width="9.6" height="12.8" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="12.5" r="0.9" fill="currentColor" />
        </svg>
      );

    case "facebook":
      return (
        <svg {...commonProps}>
          <path d="M10.2 15V9.5H12L12.3 7.4H10.2V6.1C10.2 5.5 10.4 5.1 11.3 5.1H12.4V3.2C11.9 3.1 11.4 3 10.9 3C9.3 3 8.2 4 8.2 5.8V7.4H6.6V9.5H8.2V15H10.2Z" fill="currentColor" />
        </svg>
      );

    case "naver_blog":
    case "naver_cafe":
      return (
        <svg {...commonProps}>
          <rect x="2.7" y="2.7" width="12.6" height="12.6" rx="3" fill="currentColor" />
          <path d="M6 12.5V5.5L12 12.5V5.5" stroke="#fff" strokeWidth="1.6" />
        </svg>
      );

    case "telegram":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="9" r="6.3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12.9 5.8L10.8 12.1C10.6 12.8 10.1 12.9 9.5 12.5L7.6 11.1L6.7 12C6.6 12.1 6.5 12.2 6.3 12.2L6.6 10.1L10.5 6.6C10.7 6.4 10.5 6.3 10.2 6.5L5.4 9.5L3.4 8.9C2.7 8.7 2.7 8.2 3.5 7.9L11.3 4.9C12 4.6 13.4 4.4 12.9 5.8Z" fill="currentColor" />
        </svg>
      );

    case "discord":
      return (
        <svg {...commonProps}>
          <path
            d="M5.2 5.1C6.3 4.6 7.5 4.3 8.9 4.3C10.3 4.3 11.6 4.6 12.7 5.1C13.5 6.4 14 7.8 14.2 9.3C13.4 9.9 12.7 10.3 11.9 10.5C11.7 10.2 11.6 9.9 11.5 9.6C11.8 9.5 12 9.4 12.3 9.2C12.2 9.1 12.1 9 12 8.9C11.1 9.3 10.1 9.5 8.9 9.5C7.7 9.5 6.7 9.3 5.8 8.9C5.7 9 5.6 9.1 5.5 9.2C5.8 9.4 6 9.5 6.3 9.6C6.2 9.9 6.1 10.2 5.9 10.5C5.1 10.3 4.4 9.9 3.6 9.3C3.8 7.8 4.3 6.4 5.2 5.1ZM7.3 8.8C7.8 8.8 8.1 8.4 8.1 7.9C8.1 7.4 7.8 7 7.3 7C6.8 7 6.4 7.4 6.5 7.9C6.5 8.4 6.8 8.8 7.3 8.8ZM10.5 8.8C11 8.8 11.3 8.4 11.3 7.9C11.3 7.4 11 7 10.5 7C10 7 9.6 7.4 9.7 7.9C9.7 8.4 10 8.8 10.5 8.8Z"
            fill="currentColor"
          />
        </svg>
      );

    case "kakao_channel":
      return (
        <svg {...commonProps}>
          <path
            d="M9 3C5.7 3 3 5.1 3 7.8C3 9.5 4 11 5.5 11.8L5 14.6L7.8 12.8C8.2 12.9 8.6 13 9 13C12.3 13 15 10.9 15 8.2C15 5.5 12.3 3 9 3Z"
            fill="currentColor"
          />
        </svg>
      );

    case "media":
      return (
        <svg {...commonProps}>
          <rect x="2.8" y="3.2" width="12.4" height="11.6" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.1 7.2L8.3 8.8L11.9 6.2L13.8 8V13.2H4.2V9.6L6.1 7.2Z" fill="currentColor" />
        </svg>
      );

    case "account":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="6.2" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.1 14.2C4.8 12.3 6.7 11.1 9 11.1C11.3 11.1 13.2 12.3 13.9 14.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    case "lead_db":
      return (
        <svg {...commonProps}>
          <ellipse cx="9" cy="4.9" rx="4.8" ry="1.9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.2 4.9V10.5C4.2 11.6 6.3 12.5 9 12.5C11.7 12.5 13.8 11.6 13.8 10.5V4.9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.2 8C4.2 9.1 6.3 10 9 10C11.7 10 13.8 9.1 13.8 8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="9" r="6.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 5.4V9.4L11.7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}

function getModeStyle(mode: CategoryVisualMode) {
  if (mode === "dark") {
    return {
      wrapBackground: "#2f2417",
      wrapColor: "#ffffff",
      iconBackground: "rgba(255,255,255,0.12)",
      iconColor: "#ffffff",
    };
  }

  if (mode === "ghost") {
    return {
      wrapBackground: "rgba(255,255,255,0.94)",
      wrapColor: "#2f2417",
      iconBackground: "#f3ebdf",
      iconColor: "#6b543c",
    };
  }

  return {
    wrapBackground: "#f4ebdc",
    wrapColor: "#6e4e28",
    iconBackground: "#fff7ec",
    iconColor: "#6b543c",
  };
}

export function CategoryBadge({
  category,
  label,
  mode = "light",
  size = "md",
}: {
  category: string | null | undefined;
  label?: string;
  mode?: CategoryVisualMode;
  size?: "sm" | "md";
}) {
  const text = label || getCategoryLabel(category);
  const palette = getModeStyle(mode);
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 8 : 9,
        height: isSmall ? 28 : 30,
        padding: isSmall ? "0 10px" : "0 12px",
        borderRadius: 999,
        background: palette.wrapBackground,
        color: palette.wrapColor,
        fontSize: isSmall ? 11 : 12,
        fontWeight: 800,
        backdropFilter: mode === "ghost" ? "blur(8px)" : undefined,
        maxWidth: "100%",
      }}
    >
      <span
        style={{
          width: isSmall ? 18 : 18,
          height: isSmall ? 18 : 18,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: palette.iconBackground,
          color: palette.iconColor,
          flex: "0 0 auto",
        }}
      >
        <CategoryIcon value={category} size={isSmall ? 16 : 16} />
      </span>
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </span>
  );
}