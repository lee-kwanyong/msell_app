"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TypeOption = {
  value: string;
  label: string;
  logoText: string;
  logoBg: string;
  logoColor: string;
  featured?: boolean;
};

type CategoryGroup = {
  value: string;
  label: string;
  icon: string;
  types: TypeOption[];
};

type CategoryDropdownProps = {
  name?: string;
  defaultValue?: string | null;
  required?: boolean;
  disabled?: boolean;
  categories?: string[];
  showCategoryLabel?: boolean;
  showTypeLabel?: boolean;
  inline?: boolean;
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    value: "creator-assets",
    label: "크리에이터 자산",
    icon: "🎬",
    types: [
      {
        value: "youtube-channel",
        label: "YouTube Channel",
        logoText: "YT",
        logoBg: "#fff1f2",
        logoColor: "#b91c1c",
        featured: true,
      },
      {
        value: "instagram-account",
        label: "Instagram Account",
        logoText: "IG",
        logoBg: "#fdf0f7",
        logoColor: "#b83b7c",
        featured: true,
      },
      {
        value: "tiktok-account",
        label: "TikTok Account",
        logoText: "TT",
        logoBg: "#eefcff",
        logoColor: "#0f766e",
      },
    ],
  },
  {
    value: "content-assets",
    label: "콘텐츠 자산",
    icon: "📚",
    types: [
      {
        value: "newsletter-community",
        label: "Newsletter / Community",
        logoText: "NC",
        logoBg: "#fff7ed",
        logoColor: "#c2410c",
      },
      {
        value: "course-digital-content",
        label: "Course / Digital Content",
        logoText: "CD",
        logoBg: "#eef2ff",
        logoColor: "#3730a3",
      },
    ],
  },
  {
    value: "web-assets",
    label: "웹 자산",
    icon: "🌐",
    types: [
      {
        value: "website-blog",
        label: "Website / Blog",
        logoText: "WB",
        logoBg: "#eff6ff",
        logoColor: "#1d4ed8",
        featured: true,
      },
      {
        value: "saas-app",
        label: "SaaS / App",
        logoText: "SA",
        logoBg: "#ecfdf5",
        logoColor: "#15803d",
      },
    ],
  },
  {
    value: "commerce-assets",
    label: "커머스 자산",
    icon: "🛒",
    types: [
      {
        value: "store-commerce",
        label: "Store / Commerce",
        logoText: "SC",
        logoBg: "#fefce8",
        logoColor: "#a16207",
      },
    ],
  },
  {
    value: "domain-marketing-assets",
    label: "도메인/마케팅 자산",
    icon: "📈",
    types: [
      {
        value: "domain",
        label: "Domain",
        logoText: "DM",
        logoBg: "#f3f4f6",
        logoColor: "#111827",
      },
      {
        value: "marketing-asset",
        label: "Marketing Asset",
        logoText: "MA",
        logoBg: "#ecfccb",
        logoColor: "#4d7c0f",
      },
    ],
  },
];

const FEATURED_TYPES = CATEGORY_GROUPS.flatMap((group) =>
  group.types
    .filter((type) => type.featured)
    .map((type) => ({
      ...type,
      groupValue: group.value,
      groupLabel: group.label,
      groupIcon: group.icon,
    }))
);

function normalize(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function findGroupByTypeLabel(typeLabel?: string | null) {
  if (!typeLabel) return null;

  for (const group of CATEGORY_GROUPS) {
    const found = group.types.find(
      (item) =>
        item.label === typeLabel ||
        item.value === typeLabel ||
        normalize(item.label) === normalize(typeLabel)
    );

    if (found) {
      return {
        group,
        type: found,
      };
    }
  }

  return null;
}

function getTypesByGroupValue(groupValue?: string | null) {
  const group = CATEGORY_GROUPS.find((item) => item.value === groupValue);
  return group?.types ?? [];
}

export default function CategoryDropdown({
  name = "category",
  defaultValue,
  required = false,
  disabled = false,
  showCategoryLabel = true,
  showTypeLabel = true,
  inline = false,
}: CategoryDropdownProps) {
  const initialResolved = useMemo(() => {
    const found = findGroupByTypeLabel(defaultValue);
    if (found) {
      return {
        groupValue: found.group.value,
        typeValue: found.type.value,
      };
    }

    return {
      groupValue: "",
      typeValue: "",
    };
  }, [defaultValue]);

  const [groupValue, setGroupValue] = useState(initialResolved.groupValue);
  const [typeValue, setTypeValue] = useState(initialResolved.typeValue);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  const typeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const found = findGroupByTypeLabel(defaultValue);
    setGroupValue(found?.group.value ?? "");
    setTypeValue(found?.type.value ?? "");
  }, [defaultValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!typeMenuRef.current) return;
      if (typeMenuRef.current.contains(event.target as Node)) return;
      setIsTypeMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsTypeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedGroup =
    CATEGORY_GROUPS.find((group) => group.value === groupValue) ?? null;

  const availableTypes = getTypesByGroupValue(groupValue);

  const selectedType =
    availableTypes.find((type) => type.value === typeValue) ?? null;

  const finalCategoryValue = selectedType?.label ?? "";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name={name} value={finalCategoryValue} />
      <input type="hidden" name="category_group" value={selectedGroup?.label ?? ""} />
      <input type="hidden" name="category_type" value={selectedType?.label ?? ""} />

      {!groupValue ? (
        <div style={featuredBox}>
          <div style={featuredTitle}>추천 거래유형</div>
          <div style={featuredList}>
            {FEATURED_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setGroupValue(item.groupValue);
                  setTypeValue(item.value);
                }}
                disabled={disabled}
                style={featuredButton}
              >
                <span
                  style={{
                    ...logoBadge,
                    background: item.logoBg,
                    color: item.logoColor,
                  }}
                >
                  {item.logoText}
                </span>
                <span style={featuredButtonText}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: inline ? "minmax(0, 1fr) minmax(0, 1fr)" : "1fr",
          gap: 16,
        }}
      >
        <div style={fieldBlock}>
          {showCategoryLabel ? <label style={labelStyle}>카테고리</label> : null}

          <div style={selectWrap}>
            <select
              value={groupValue}
              onChange={(e) => {
                setGroupValue(e.target.value);
                setTypeValue("");
                setIsTypeMenuOpen(false);
              }}
              disabled={disabled}
              required={required}
              style={nativeSelect}
            >
              <option value="">대분류를 선택하세요</option>
              {CATEGORY_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.icon} {group.label}
                </option>
              ))}
            </select>

            <span style={arrowStyle}>▾</span>
          </div>
        </div>

        <div style={fieldBlock}>
          {showTypeLabel ? <label style={labelStyle}>타입</label> : null}

          <div ref={typeMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              disabled={disabled || !groupValue}
              onClick={() => {
                if (!groupValue || disabled) return;
                setIsTypeMenuOpen((prev) => !prev);
              }}
              style={{
                ...typeButton,
                ...(disabled || !groupValue ? typeButtonDisabled : null),
              }}
            >
              {selectedType ? (
                <span style={typeButtonContent}>
                  <span
                    style={{
                      ...logoBadge,
                      background: selectedType.logoBg,
                      color: selectedType.logoColor,
                    }}
                  >
                    {selectedType.logoText}
                  </span>
                  <span style={typeText}>{selectedType.label}</span>
                </span>
              ) : (
                <span style={placeholderText}>
                  {groupValue ? "세부 타입을 선택하세요" : "먼저 카테고리를 선택하세요"}
                </span>
              )}

              <span style={arrowStyle}>▾</span>
            </button>

            {isTypeMenuOpen && groupValue ? (
              <div style={menuWrap}>
                <div style={menuHeader}>
                  <span style={menuHeaderTitle}>
                    {selectedGroup?.icon} {selectedGroup?.label}
                  </span>
                  <span style={menuHeaderCount}>{availableTypes.length}개</span>
                </div>

                <div style={menuList}>
                  {availableTypes.map((type) => {
                    const isSelected = type.value === typeValue;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setTypeValue(type.value);
                          setIsTypeMenuOpen(false);
                        }}
                        style={{
                          ...menuItem,
                          ...(isSelected ? menuItemSelected : null),
                        }}
                      >
                        <span
                          style={{
                            ...logoBadge,
                            background: type.logoBg,
                            color: type.logoColor,
                          }}
                        >
                          {type.logoText}
                        </span>

                        <span style={menuItemText}>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedGroup || selectedType ? (
        <div style={summaryBox}>
          <div style={summaryTitle}>선택된 분류</div>
          <div style={summaryValue}>
            <span>{selectedGroup ? `${selectedGroup.icon} ${selectedGroup.label}` : "-"}</span>
            <span style={summaryDivider}>/</span>
            <span>{selectedType?.label ?? "-"}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const fieldBlock: React.CSSProperties = {
  display: "grid",
  gap: 8,
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  color: "#2f2417",
};

const selectWrap: React.CSSProperties = {
  position: "relative",
};

const nativeSelect: React.CSSProperties = {
  width: "100%",
  height: 56,
  borderRadius: 16,
  border: "1px solid #dbcdb9",
  background: "#fffdf9",
  padding: "0 44px 0 16px",
  color: "#2f2417",
  fontSize: 15,
  fontWeight: 700,
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const arrowStyle: React.CSSProperties = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#8a7156",
  fontSize: 14,
  pointerEvents: "none",
};

const typeButton: React.CSSProperties = {
  width: "100%",
  minHeight: 56,
  borderRadius: 16,
  border: "1px solid #dbcdb9",
  background: "#fffdf9",
  padding: "12px 44px 12px 14px",
  color: "#2f2417",
  textAlign: "left",
  position: "relative",
  cursor: "pointer",
};

const typeButtonDisabled: React.CSSProperties = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const typeButtonContent: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const typeText: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  lineHeight: 1.4,
  color: "#2f2417",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const placeholderText: React.CSSProperties = {
  color: "#9a8268",
  fontSize: 15,
  fontWeight: 700,
};

const menuWrap: React.CSSProperties = {
  position: "absolute",
  zIndex: 40,
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  borderRadius: 18,
  border: "1px solid #dbcdb9",
  background: "#fffdf9",
  boxShadow: "0 18px 42px rgba(47, 36, 23, 0.12)",
  overflow: "hidden",
};

const menuHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 16px",
  borderBottom: "1px solid #eee2d3",
  background: "#faf4ec",
};

const menuHeaderTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#2f2417",
};

const menuHeaderCount: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#8a7156",
};

const menuList: React.CSSProperties = {
  maxHeight: 340,
  overflowY: "auto",
  padding: 8,
};

const menuItem: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 10px",
  borderRadius: 12,
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
};

const menuItemSelected: React.CSSProperties = {
  background: "#f6efe6",
};

const menuItemText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  lineHeight: 1.45,
  color: "#2f2417",
};

const logoBadge: React.CSSProperties = {
  minWidth: 34,
  height: 34,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 8px",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  flexShrink: 0,
};

const summaryBox: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #eadfce",
  background: "#fbf6ef",
  padding: "12px 14px",
};

const summaryTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#8a7156",
  marginBottom: 6,
};

const summaryValue: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
  color: "#2f2417",
  fontSize: 14,
  fontWeight: 800,
};

const summaryDivider: React.CSSProperties = {
  color: "#b89d80",
};

const featuredBox: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid #eadfce",
  background: "#fbf6ef",
  padding: "14px",
};

const featuredTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#8a7156",
  marginBottom: 10,
};

const featuredList: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const featuredButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 42,
  padding: "0 12px",
  borderRadius: 999,
  border: "1px solid #dbcdb9",
  background: "#fffdf9",
  color: "#2f2417",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const featuredButtonText: React.CSSProperties = {
  lineHeight: 1,
};