"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

  const safeCategories = useMemo(() => {
    return (categories || []).filter(
      (item) =>
        item &&
        typeof item.value === "string" &&
        item.value.trim() &&
        typeof item.label === "string" &&
        item.label.trim()
    );
  }, [categories]);

  const selectedItem =
    safeCategories.find((item) => item.value === selected) || null;

  return (
    <div ref={rootRef} className="ms-category-dropdown">
      <input type="hidden" name={name} value={selected} />

      {required ? (
        <input
          aria-hidden="true"
          tabIndex={-1}
          value={selected}
          onChange={() => {}}
          required
          className="ms-category-dropdown__required-proxy"
        />
      ) : null}

      <button
        type="button"
        className="ms-category-dropdown__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ms-category-dropdown__value">
          {selectedItem ? selectedItem.label : "카테고리를 선택하세요"}
        </span>
        <span className="ms-category-dropdown__arrow">{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div className="ms-category-dropdown__menu" role="listbox">
          {safeCategories.length === 0 ? (
            <div className="ms-category-dropdown__empty">
              카테고리가 없습니다.
            </div>
          ) : (
            safeCategories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`ms-category-dropdown__item${
                  selected === item.value ? " is-selected" : ""
                }`}
                onClick={() => {
                  setSelected(item.value);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}