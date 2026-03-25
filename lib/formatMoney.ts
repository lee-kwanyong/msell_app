import type { Currency, Locale } from "./globalPrefs";

export type ListingPrice = {
  currency: Currency;
  amount: number; // numeric -> number로 받아온다고 가정 (소수 포함)
  is_primary?: boolean;
};

function nf(locale: Locale, currency: Currency) {
  // 크립토는 통화 포맷보다 숫자 포맷이 더 자연스러움(USDT/BTC/USDD 등)
  const isFiat = currency === "KRW" || currency === "USD" || currency === "EUR";
  if (!isFiat) return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", { maximumFractionDigits: 8 });

  // fiat는 currency 스타일 사용
  const map: Record<Currency, string> = {
    KRW: "KRW",
    USD: "USD",
    EUR: "EUR",
    USDT: "USD", // fallback (unused)
    USDD: "USD",
    BTC: "USD",
    ETH: "USD",
  };
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency",
    currency: map[currency],
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  });
}

export function formatAmount(locale: Locale, currency: Currency, amount: number) {
  const isFiat = currency === "KRW" || currency === "USD" || currency === "EUR";
  if (isFiat) return nf(locale, currency).format(amount);

  // 크립토/스테이블: "800 USDT" 형태가 일반적
  const num = nf(locale, currency).format(amount);
  return `${num} ${currency}`;
}

// 가격 여러 개 중 "표시 우선 통화" 먼저 보여주기
export function pickPrimaryPrice(
  prices: ListingPrice[] | null | undefined,
  preferredCurrency: Currency
): ListingPrice | null {
  if (!prices || prices.length === 0) return null;

  // 1) is_primary
  const p1 = prices.find((p) => p.is_primary);
  if (p1) return p1;

  // 2) preferred currency
  const p2 = prices.find((p) => p.currency === preferredCurrency);
  if (p2) return p2;

  // 3) stable 우선
  const stableOrder: Currency[] = ["USDT", "USDD", "USD", "KRW", "EUR", "BTC", "ETH"];
  for (const c of stableOrder) {
    const p = prices.find((x) => x.currency === c);
    if (p) return p;
  }

  return prices[0];
}

export function formatPriceStack(
  locale: Locale,
  preferredCurrency: Currency,
  prices: ListingPrice[] | null | undefined
) {
  if (!prices || prices.length === 0) return { primary: null as string | null, others: [] as string[] };

  const primary = pickPrimaryPrice(prices, preferredCurrency);
  const primaryText = primary ? formatAmount(locale, primary.currency, primary.amount) : null;

  const others = prices
    .filter((p) => !primary || p.currency !== primary.currency)
    .map((p) => formatAmount(locale, p.currency, p.amount));

  return { primary: primaryText, others };
}