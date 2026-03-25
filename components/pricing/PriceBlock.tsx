"use client";

import { useEffect, useMemo, useState } from "react";

type ListingPrice = {
  label?: string | null;
  amount?: number | string | null;
  currency?: string | null;
};

type Currency = "USDT" | "BTC" | "ETH" | "KRW" | "USD";

type Locale = "ko-KR" | "en-US";

type PriceBlockProps = {
  prices?: ListingPrice[];
};

function normalizeCurrency(value?: string | null): Currency {
  const upper = (value || "").toUpperCase();

  if (upper === "BTC") return "BTC";
  if (upper === "ETH") return "ETH";
  if (upper === "KRW") return "KRW";
  if (upper === "USD") return "USD";
  return "USDT";
}

function normalizeLocale(currency: Currency): Locale {
  if (currency === "KRW") return "ko-KR";
  return "en-US";
}

function parseAmount(value?: number | string | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatAmount(amount: number, currency: Currency, locale: Locale) {
  if (currency === "BTC" || currency === "ETH") {
    return `${amount.toLocaleString(locale, {
      maximumFractionDigits: 8,
    })} ${currency}`;
  }

  if (currency === "USDT" || currency === "USD") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PriceBlock({ prices = [] }: PriceBlockProps) {
  const initialCurrency = normalizeCurrency(prices[0]?.currency);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [locale, setLocale] = useState<Locale>(normalizeLocale(initialCurrency));

  useEffect(() => {
    const nextCurrency = normalizeCurrency(prices[0]?.currency);
    setCurrency(nextCurrency);
    setLocale(normalizeLocale(nextCurrency));
  }, [prices]);

  const visiblePrices = useMemo(() => {
    const normalized = prices.map((item, index) => {
      const itemCurrency = normalizeCurrency(item.currency || currency);
      return {
        id: `${index}-${item.label || "price"}`,
        label: item.label || "가격",
        amount: parseAmount(item.amount),
        currency: itemCurrency,
        locale: normalizeLocale(itemCurrency),
      };
    });

    if (normalized.length > 0) return normalized;

    return [
      {
        id: "default-price",
        label: "가격",
        amount: 0,
        currency,
        locale,
      },
    ];
  }, [prices, currency, locale]);

  return (
    <section
      style={{
        display: "grid",
        gap: 14,
        padding: 20,
        borderRadius: 20,
        border: "1px solid #eadfcf",
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(47,36,23,0.06)",
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
              fontSize: 13,
              color: "#8b7a67",
              marginBottom: 6,
            }}
          >
            Price
          </div>
          <h3
            style={{
              margin: 0,
              color: "#2f2417",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            가격 정보
          </h3>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {(["USDT", "BTC", "ETH", "KRW", "USD"] as Currency[]).map((item) => {
            const active = currency === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCurrency(item);
                  setLocale(normalizeLocale(item));
                }}
                style={{
                  border: active ? "1px solid #2f2417" : "1px solid #d9c9b3",
                  background: active ? "#2f2417" : "#ffffff",
                  color: active ? "#ffffff" : "#2f2417",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
        }}
      >
        {visiblePrices.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #eadfcf",
              borderRadius: 16,
              background: "#fcfaf6",
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#8b7a67",
                marginBottom: 8,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#2f2417",
                lineHeight: 1.2,
              }}
            >
              {formatAmount(item.amount, item.currency, item.locale)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}