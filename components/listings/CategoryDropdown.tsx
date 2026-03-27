"use client";

import { useEffect, useRef, useState } from "react";

type CategoryDropdownProps = {
  name: string;
  defaultValue?: string;
  categories?: string[];
};

const DEFAULT_CATEGORIES = [
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

function getCategoryIcon(category: string) {
  switch (category) {
    case "유튜브 채널":
      return "▶";
    case "인스타그램 계정":
      return "◎";
    case "틱톡 계정":
      return "♪";
    case "블로그":
      return "✎";
    case "카페":
      return "☕";
    case "도메인":
      return "⌘";
    case "웹사이트":
      return "◫";
    case "쇼핑몰":
      return "▣";
    case "앱":
      return "◧";
    case "전자책":
      return "▤";
    case "강의":
      return "△";
    case "커뮤니티":
      return "◌";
    case "뉴스레터":
      return "✉";
    case "디지털 상품":
      return "◆";
    default:
      return "•";
  }
}

export default function CategoryDropdown({
  name,
  defaultValue = "",
  categories = DEFAULT_CATEGORIES,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelected(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedLabel = selected || "카테고리 선택";

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          height: 60,
          borderRadius: 18,
          border: "1px solid #eadfcf",
          background: "#fffdf9",
          padding: "0 18px",
          color: selected ? "#24190f" : "#7f684f",
          fontSize: 16,
          fontWeight: 700,
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          boxShadow: open ? "0 10px 24px rgba(61, 41, 22, 0.08)" : "none",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: selected ? "#f2e8db" : "#f7efe4",
              border: "1px solid #eadfcf",
              color: "#6d4b2a",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {getCategoryIcon(selectedLabel)}
          </span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedLabel}
          </span>
        </span>

        <span
          style={{
            color: "#8a7156",
            fontSize: 14,
            fontWeight: 900,
            marginLeft: 12,
            flexShrink: 0,
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="카테고리 선택"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: 360,
            overflowY: "auto",
            borderRadius: 18,
            border: "1px solid #eadfcf",
            background: "#fffdf9",
            boxShadow: "0 18px 40px rgba(61, 41, 22, 0.12)",
            padding: 8,
          }}
        >
          {categories.map((category) => {
            const active = selected === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelected(category);
                  setOpen(false);
                }}
                role="option"
                aria-selected={active}
                style={{
                  width: "100%",
                  minHeight: 48,
                  border: 0,
                  borderRadius: 14,
                  background: active ? "#f2e8db" : "transparent",
                  color: "#24190f",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "#fbf2e6",
                    border: "1px solid #eadfcf",
                    color: "#6d4b2a",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {getCategoryIcon(category)}
                </span>

                <span
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 900 : 700,
                    color: "#24190f",
                  }}
                >
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}