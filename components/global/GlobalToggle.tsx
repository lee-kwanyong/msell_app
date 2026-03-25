"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  COUNTRY_LABELS,
  COUNTRY_LOCALES,
  DEFAULT_PREFS,
  LOCALE_LABELS,
  applyCountryDefaults,
  loadPrefs,
  savePrefs,
  type Country,
  type Currency,
  type GlobalPrefs,
  type Locale,
} from "@/lib/globalPrefs";

function emitPrefs(p: GlobalPrefs) {
  window.dispatchEvent(new CustomEvent("msell:prefs-changed", { detail: p }));
}

export default function GlobalToggle() {
  const [prefs, setPrefs] = useState<GlobalPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);
  }, []);

  const countryLocales = useMemo<Locale[]>(
    () => COUNTRY_LOCALES[prefs.country] ?? ["en-US"],
    [prefs.country]
  );

  // 국가 변경: 국가 기본값(언어/통화) 자동 적용
  const onChangeCountry = (country: Country) => {
    const next = applyCountryDefaults(country, prefs);
    setPrefs(next);
    savePrefs(next);
    emitPrefs(next);
  };

  // 언어 변경: 해당 국가 허용 로케일만 허용
  const onChangeLocale = (locale: Locale) => {
    const allowed = COUNTRY_LOCALES[prefs.country] ?? ["en-US"];
    const safeLocale = allowed.includes(locale) ? locale : allowed[0];
    const next = { ...prefs, locale: safeLocale };
    setPrefs(next);
    savePrefs(next);
    emitPrefs(next);
  };

  // 통화 변경: 사용자 선택 유지
  const onChangeCurrency = (currency: Currency) => {
    const next = { ...prefs, currency };
    setPrefs(next);
    savePrefs(next);
    emitPrefs(next);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Country */}
      <label className="pill" style={{ gap: 8 }}>
        <span style={{ opacity: 0.7 }}>Country</span>
        <select
          value={prefs.country}
          onChange={(e) => onChangeCountry(e.target.value as Country)}
          style={{ border: 0, background: "transparent", outline: "none", cursor: "pointer" }}
          aria-label="Country"
        >
          {Object.entries(COUNTRY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>

      {/* Language (country-specific) */}
      <label className="pill" style={{ gap: 8 }}>
        <span style={{ opacity: 0.7 }}>Lang</span>
        <select
          value={prefs.locale}
          onChange={(e) => onChangeLocale(e.target.value as Locale)}
          style={{ border: 0, background: "transparent", outline: "none", cursor: "pointer" }}
          aria-label="Language"
        >
          {countryLocales.map((loc) => (
            <option key={loc} value={loc}>
              {LOCALE_LABELS[loc] ?? loc}
            </option>
          ))}
        </select>
      </label>

      {/* Currency */}
      <label className="pill" style={{ gap: 8 }}>
        <span style={{ opacity: 0.7 }}>Currency</span>
        <select
          value={prefs.currency}
          onChange={(e) => onChangeCurrency(e.target.value as Currency)}
          style={{ border: 0, background: "transparent", outline: "none", cursor: "pointer" }}
          aria-label="Display currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}