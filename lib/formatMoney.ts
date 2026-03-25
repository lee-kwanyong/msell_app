export type MoneyLocale = "ko-KR" | "en-US";

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function normalizeMoneyLocale(locale?: string | null): MoneyLocale {
  if (!locale) return "en-US";

  const normalized = locale.trim().toLowerCase();

  if (normalized === "ko" || normalized === "ko-kr") {
    return "ko-KR";
  }

  return "en-US";
}

export function formatMoney(
  amount: number | string | null | undefined,
  currency?: string | null,
  locale?: string | null
): string {
  const safeAmount = toNumber(amount);
  const normalizedCurrency = (currency || "USD").trim().toUpperCase();
  const normalizedLocale = normalizeMoneyLocale(locale);

  if (normalizedCurrency === "KRW") {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(safeAmount);
  }

  if (normalizedCurrency === "USD" || normalizedCurrency === "EUR") {
    return new Intl.NumberFormat(normalizedLocale, {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }

  if (normalizedCurrency === "USDT" || normalizedCurrency === "USDC") {
    return `${safeAmount.toLocaleString(normalizedLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} ${normalizedCurrency}`;
  }

  if (
    normalizedCurrency === "BTC" ||
    normalizedCurrency === "ETH" ||
    normalizedCurrency === "TRX"
  ) {
    return `${safeAmount.toLocaleString(normalizedLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })} ${normalizedCurrency}`;
  }

  return `${safeAmount.toLocaleString(normalizedLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${normalizedCurrency}`;
}

export default formatMoney;