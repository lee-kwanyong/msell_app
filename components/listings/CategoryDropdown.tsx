"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CategoryOption = {
  value: string;
  label: string;
  icon: string;
  hint?: string;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "youtube", label: "유튜브", icon: "▶", hint: "채널 / 브랜드 계정" },
  { value: "instagram", label: "인스타그램", icon: "◎", hint: "계정 / 페이지" },
  { value: "tiktok", label: "틱톡", icon: "♪", hint: "숏폼 채널" },
  { value: "telegram", label: "텔레그램", icon: "✈", hint: "방 / 커뮤니티" },
  { value: "website", label: "웹사이트", icon: "⌘", hint: "사이트 / 운영권" },
  { value: "community", label: "커뮤니티", icon: "◉", hint: "카페 / 포럼 / 멤버십" },
  { value: "domain", label: "도메인", icon: "◇", hint: "도메인 네임" },
  { value: "app", label: "앱", icon: "▣", hint: "앱 서비스 / 운영권" },
  { value: "newsletter", label: "뉴스레터", icon: "✉", hint: "구독자 기반 자산" },
  { value: "software", label: "소프트웨어", icon: "⌥", hint: "툴 / SaaS / 라이선스" },
  { value: "ecommerce", label: "쇼핑몰", icon: "□", hint: "스토어 / 커머스 자산" },
  { value: "other", label: "기타", icon: "•", hint: "기타 디지털 자산" },
];

export default function CategoryDropdown({
  name = "category",
  value,
  defaultValue,
  required = false,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initialValue = value ?? defaultValue ?? "";
  const [selected, setSelected] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const selectedOption = useMemo(
    () =>
      CATEGORY_OPTIONS.find((option) => option.value === selected) ?? null,
    [selected]
  );

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={selected} required={required} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: 58,
          borderRadius: 18,
          border: open ? "1px solid #7b6240" : "1px solid #d9c7b1",
          background: "#fff",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          boxShadow: open ? "0 0 0 3px rgba(123, 98, 64, 0.08)" : "none",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {selectedOption ? (
            <>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#f4ecdf",
                  color: "#2f2417",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {selectedOption.icon}
              </span>

              <span style={{ minWidth: 0, textAlign: "left" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#1f160e",
                    lineHeight: 1.2,
                  }}
                >
                  {selectedOption.label}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    fontSize: 12,
                    color: "#8a745d",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedOption.hint}
                </span>
              </span>
            </>
          ) : (
            <span
              style={{
                fontSize: 15,
                color: "#8a745d",
                fontWeight: 600,
              }}
            >
              카테고리를 선택하세요
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: 14,
            color: "#6f5a45",
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            zIndex: 30,
            background: "#fffdf9",
            border: "1px solid #decdb7",
            borderRadius: 20,
            padding: 10,
            boxShadow: "0 24px 60px rgba(32, 23, 15, 0.14)",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const isActive = selected === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelected(option.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    border: isActive
                      ? "1px solid #7b6240"
                      : "1px solid #eadfcf",
                    background: isActive ? "#f8f1e7" : "#fff",
                    borderRadius: 16,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isActive ? "#2f2417" : "#f4ecdf",
                      color: isActive ? "#fff" : "#2f2417",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {option.icon}
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#1f160e",
                        lineHeight: 1.2,
                      }}
                    >
                      {option.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 12,
                        color: "#8a745d",
                        lineHeight: 1.2,
                      }}
                    >
                      {option.hint}
                    </span>
                  </span>

                  {isActive ? (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "#2f2417",
                        flexShrink: 0,
                      }}
                    >
                      선택됨
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}