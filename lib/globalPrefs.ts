export type Country =
  | "KR"
  | "US"
  | "JP"
  | "CN"
  | "GB"
  | "DE"
  | "FR"
  | "SG"
  | "HK"
  | "AE"
  | "VN"
  | "TH"
  | "ID"
  | "PH"
  | "IN"
  | "BR"
  | "MX"
  | "TR"
  | "SA"
  | "NG"
  | "ZA"
  | "OTHER";

export type Locale =
  | "ko-KR"
  | "en-US"
  | "en-GB"
  | "ja-JP"
  | "zh-CN"
  | "zh-HK"
  | "de-DE"
  | "fr-FR"
  | "vi-VN"
  | "th-TH"
  | "id-ID"
  | "tl-PH"
  | "hi-IN";

export type Currency = "USDT" | "BTC" | "USDD" | "USD" | "KRW" | "ETH" | "EUR";

export type GlobalPrefs = {
  country: Country;   // ✅ 국가(지역) 기준
  locale: Locale;     // ✅ 국가에 맞는 기본 언어/로케일
  currency: Currency; // ✅ 표시 우선 통화
};

const KEY = "msell:prefs:v2";

export const DEFAULT_PREFS: GlobalPrefs = {
  country: "KR",
  locale: "ko-KR",
  currency: "USDT",
};

export const CURRENCIES: Currency[] = ["USDT", "BTC", "USDD", "USD", "KRW", "ETH", "EUR"];

// 국가 → 기본 로케일/통화(초기값/자동 설정)
export const COUNTRY_DEFAULTS: Record<Country, { locale: Locale; currency: Currency }> = {
  KR: { locale: "ko-KR", currency: "KRW" },
  US: { locale: "en-US", currency: "USD" },
  JP: { locale: "ja-JP", currency: "USD" },
  CN: { locale: "zh-CN", currency: "USD" },
  GB: { locale: "en-GB", currency: "USD" },
  DE: { locale: "de-DE", currency: "EUR" },
  FR: { locale: "fr-FR", currency: "EUR" },
  SG: { locale: "en-US", currency: "USD" },
  HK: { locale: "zh-HK", currency: "USD" },
  AE: { locale: "en-US", currency: "USD" },
  VN: { locale: "vi-VN", currency: "USDT" },
  TH: { locale: "th-TH", currency: "USDT" },
  ID: { locale: "id-ID", currency: "USDT" },
  PH: { locale: "tl-PH", currency: "USDT" },
  IN: { locale: "hi-IN", currency: "USDT" },
  BR: { locale: "en-US", currency: "USDT" },
  MX: { locale: "en-US", currency: "USDT" },
  TR: { locale: "en-US", currency: "USDT" },
  SA: { locale: "en-US", currency: "USDT" },
  NG: { locale: "en-US", currency: "USDT" },
  ZA: { locale: "en-US", currency: "USDT" },
  OTHER: { locale: "en-US", currency: "USDT" },
};

export const COUNTRY_LABELS: Record<Country, string> = {
  KR: "Korea (KR)",
  US: "United States (US)",
  JP: "Japan (JP)",
  CN: "China (CN)",
  GB: "United Kingdom (GB)",
  DE: "Germany (DE)",
  FR: "France (FR)",
  SG: "Singapore (SG)",
  HK: "Hong Kong (HK)",
  AE: "UAE (AE)",
  VN: "Vietnam (VN)",
  TH: "Thailand (TH)",
  ID: "Indonesia (ID)",
  PH: "Philippines (PH)",
  IN: "India (IN)",
  BR: "Brazil (BR)",
  MX: "Mexico (MX)",
  TR: "Turkey (TR)",
  SA: "Saudi Arabia (SA)",
  NG: "Nigeria (NG)",
  ZA: "South Africa (ZA)",
  OTHER: "Other",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  "ko-KR": "한국어 (KR)",
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "ja-JP": "日本語 (JP)",
  "zh-CN": "中文 (简体)",
  "zh-HK": "中文 (繁體, HK)",
  "de-DE": "Deutsch (DE)",
  "fr-FR": "Français (FR)",
  "vi-VN": "Tiếng Việt (VN)",
  "th-TH": "ไทย (TH)",
  "id-ID": "Bahasa Indonesia (ID)",
  "tl-PH": "Tagalog (PH)",
  "hi-IN": "हिन्दी (IN)",
};

// 국가별 허용 로케일(원하면 더 늘려)
export const COUNTRY_LOCALES: Record<Country, Locale[]> = {
  KR: ["ko-KR", "en-US"],
  US: ["en-US"],
  JP: ["ja-JP", "en-US"],
  CN: ["zh-CN", "en-US"],
  GB: ["en-GB", "en-US"],
  DE: ["de-DE", "en-US"],
  FR: ["fr-FR", "en-US"],
  SG: ["en-US"],
  HK: ["zh-HK", "en-US"],
  AE: ["en-US"],
  VN: ["vi-VN", "en-US"],
  TH: ["th-TH", "en-US"],
  ID: ["id-ID", "en-US"],
  PH: ["tl-PH", "en-US"],
  IN: ["hi-IN", "en-US"],
  BR: ["en-US"],
  MX: ["en-US"],
  TR: ["en-US"],
  SA: ["en-US"],
  NG: ["en-US"],
  ZA: ["en-US"],
  OTHER: ["en-US"],
};

export function safeParsePrefs(raw: string | null): GlobalPrefs | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    const country = obj?.country as Country | undefined;
    const locale = obj?.locale as Locale | undefined;
    const currency = obj?.currency as Currency | undefined;

    const validCountry = country && COUNTRY_DEFAULTS[country] ? country : null;
    const validLocale =
      locale && Object.prototype.hasOwnProperty.call(LOCALE_LABELS, locale) ? locale : null;
    const validCurrency = currency && CURRENCIES.includes(currency) ? currency : null;

    if (!validCountry || !validLocale || !validCurrency) return null;

    return { country: validCountry, locale: validLocale, currency: validCurrency };
  } catch {
    return null;
  }
}

export function loadPrefs(): GlobalPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const parsed = safeParsePrefs(window.localStorage.getItem(KEY));
  return parsed ?? DEFAULT_PREFS;
}

export function savePrefs(prefs: GlobalPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(prefs));
}

export function applyCountryDefaults(country: Country, prev: GlobalPrefs): GlobalPrefs {
  const def = COUNTRY_DEFAULTS[country] ?? COUNTRY_DEFAULTS.OTHER;
  const allowedLocales = COUNTRY_LOCALES[country] ?? ["en-US"];

  // 국가 변경 시:
  // - locale은 해당 국가 기본값으로 세팅
  // - currency는 해당 국가 기본값으로 세팅 (원하면 "유지"로 바꿀 수 있음)
  const nextLocale = allowedLocales.includes(def.locale) ? def.locale : allowedLocales[0];
  return {
    ...prev,
    country,
    locale: nextLocale,
    currency: def.currency,
  };
}