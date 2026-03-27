"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_LABEL,
  CategoryBadge,
  getCategoryLabel,
} from "@/components/listings/CategoryVisual";

type CategoryOption = {
  value: string;
  label: string;
};

type CategoryDropdownProps = {
  name: string;
  defaultValue?: string;
  categories: CategoryOption[];
  required?: boolean;
};

type CanonicalCategory = {
  value: string;
  label: string;
};

const CANONICAL_CATEGORIES: CanonicalCategory[] = Object.entries(CATEGORY_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  })
);

function normalizeText(value: string | null | undefined) {
  return (value || "").trim();
}

function uniqueCategories(input: CategoryOption[]) {
  const map = new Map<string, CategoryOption>();

  for (const item of input) {
    const value = normalizeText(item.value);
    const label = normalizeText(item.label);

    if (!value || !label) continue;
    if (map.has(value)) continue;

    map.set(value, { value, label });
  }

  return Array.from(map.values());
}

function getFallbackLabel(value: string) {
  return getCategoryLabel(value);
}

export default function CategoryDropdown({
  name,
  defaultValue = "",
  categories,
  required = false,
}: CategoryDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mergedCategories = useMemo(() => {
    const canonical = CANONICAL_CATEGORIES.map((item) => ({
      value: item.value,
      label: item.label,
    }));

    const fromDb = (categories || [])
      .filter(
        (item) =>
          item &&
          typeof item.value === "string" &&
          item.value.trim() &&
          typeof item.label === "string" &&
          item.label.trim()
      )
      .map((item) => ({
        value: normalizeText(item.value),
        label: normalizeText(item.label),
      }));

    const selectedOption =
      selected &&
      !canonical.some((item) => item.value === selected) &&
      !fromDb.some((item) => item.value === selected)
        ? [{ value: selected, label: getFallbackLabel(selected) }]
        : [];

    return uniqueCategories([...canonical, ...fromDb, ...selectedOption]);
  }, [categories, selected]);

  const selectedItem =
    mergedCategories.find((item) => item.value === selected) || null;

  return (
    <div
      ref={rootRef}
      className="ms-category-dropdown"
      style={{ position: "relative", width: "100%" }}
    >
      <input type="hidden" name={name} value={selected} />

      {required ? (
        <input
          aria-hidden="true"
          tabIndex={-1}
          value={selected}
          onChange={() => {}}
          required
          style={{
            position: "absolute",
            inset: 0,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <button
        type="button"
        className="ms-category-dropdown__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          border: "1px solid #d7c6ae",
          background: "#fffdf9",
          color: "#241b11",
          borderRadius: 16,
          padding: "13px 14px",
          cursor: "pointer",
          minHeight: 56,
        }}
      >
        <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
          {selectedItem ? (
            <CategoryBadge
              category={selectedItem.value}
              label={selectedItem.label}
              mode="dark"
              size="md"
            />
          ) : (
            <span
              style={{
                color: "#9a8d7d",
                fontWeight: 700,
              }}
            >
              카테고리를 선택하세요
            </span>
          )}
        </span>

        <span
          style={{
            flex: "0 0 auto",
            color: "#6f6253",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div
          className="ms-category-dropdown__menu"
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 40,
            width: "100%",
            maxHeight: 360,
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #e6dac8",
            borderRadius: 18,
            boxShadow: "0 18px 40px rgba(47,36,23,0.12)",
            padding: 8,
          }}
        >
          {mergedCategories.length === 0 ? (
            <div
              style={{
                padding: 12,
                color: "#6f6253",
                fontSize: 14,
              }}
            >
              카테고리가 없습니다.
            </div>
          ) : (
            mergedCategories.map((item) => {
              const isSelected = selected === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  className={`ms-category-dropdown__item${
                    isSelected ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setSelected(item.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    border: 0,
                    background: isSelected ? "#f7efe3" : "transparent",
                    textAlign: "left",
                    padding: "11px 12px",
                    borderRadius: 14,
                    cursor: "pointer",
                    color: "#241b11",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <CategoryBadge
                    category={item.value}
                    label={item.label}
                    mode="light"
                    size="md"
                  />

                  {isSelected ? (
                    <span
                      style={{
                        flex: "0 0 auto",
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#2f2417",
                      }}
                    >
                      선택됨
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}