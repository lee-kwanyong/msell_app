"use client";

import { useEffect, useState } from "react";
import { loadPrefs, type Currency, type Locale } from "@/lib/globalPrefs";
import { formatPriceStack, type ListingPrice } from "@/lib/formatMoney";

export default function PriceBlock({ prices }: { prices: ListingPrice[] }) {
  const [locale, setLocale] = useState<Locale>("ko");
  const [currency, setCurrency] = useState<Currency>("USDT");

  useEffect(() => {
    const p = loadPrefs();
    setLocale(p.locale);
    setCurrency(p.currency);

    const handler = (e: any) => {
      const next = e?.detail;
      if (next?.locale) setLocale(next.locale);
      if (next?.currency) setCurrency(next.currency);
    };

    window.addEventListener("msell:prefs-changed" as any, handler);
    return () => window.removeEventListener("msell:prefs-changed" as any, handler);
  }, []);

  const { primary, others } = formatPriceStack(locale, currency, prices);

  return (
    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
      <div className="dealAsk" style={{ fontWeight: 800 }}>
        {primary ?? "-"}
      </div>
      {others.length > 0 && (
        <div style={{ fontSize: 12.5, color: "rgba(0,0,0,.55)", textAlign: "right", lineHeight: 1.35 }}>
          {others.slice(0, 2).join(" · ")}
          {others.length > 2 ? ` +${others.length - 2}` : ""}
        </div>
      )}
    </div>
  );
}