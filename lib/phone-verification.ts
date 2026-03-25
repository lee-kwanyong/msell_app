import crypto from "crypto";

const PHONE_COOKIE_NAME = "msell_phone_verified";

export function normalizePhoneNumber(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.startsWith("82")) {
    return `0${digits.slice(2)}`;
  }

  return digits;
}

export function isValidKoreanMobilePhone(input: string) {
  const phone = normalizePhoneNumber(input);
  return /^01[016789]\d{7,8}$/.test(phone);
}

export function formatPhoneForDisplay(input: string) {
  const phone = normalizePhoneNumber(input);

  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }

  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }

  return phone;
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createPhoneVerificationCookieValue(phoneNumber: string) {
  const secret = process.env.PHONE_VERIFICATION_COOKIE_SECRET;
  if (!secret) {
    throw new Error("PHONE_VERIFICATION_COOKIE_SECRET is missing.");
  }

  const payload = JSON.stringify({
    phone_number: normalizePhoneNumber(phoneNumber),
    verified_at: new Date().toISOString(),
  });

  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("hex");

  return `${encoded}.${signature}`;
}

export function verifyPhoneVerificationCookieValue(value?: string | null) {
  if (!value) return null;

  const secret = process.env.PHONE_VERIFICATION_COOKIE_SECRET;
  if (!secret) {
    throw new Error("PHONE_VERIFICATION_COOKIE_SECRET is missing.");
  }

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    )
  ) {
    return null;
  }

  const json = Buffer.from(encoded, "base64url").toString("utf8");
  const parsed = JSON.parse(json) as {
    phone_number: string;
    verified_at: string;
  };

  return {
    phone_number: normalizePhoneNumber(parsed.phone_number),
    verified_at: parsed.verified_at,
  };
}

function buildSolapiAuthorization() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("SOLAPI_API_KEY / SOLAPI_API_SECRET is missing.");
  }

  const date = new Date().toISOString();
  const salt = crypto.randomUUID();
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export async function sendVerificationSms(phoneNumber: string, code: string) {
  const sender = process.env.SOLAPI_SENDER;
  if (!sender) {
    throw new Error("SOLAPI_SENDER is missing.");
  }

  const to = normalizePhoneNumber(phoneNumber);
  const text = `[MSELL] 인증번호는 [${code}] 입니다. 3분 안에 입력해 주세요.`;

  const response = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildSolapiAuthorization(),
    },
    body: JSON.stringify({
      messages: [
        {
          to,
          from: sender,
          text,
          type: "SMS",
        },
      ],
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.errorMessage ||
        data?.message ||
        "문자 발송에 실패했습니다."
    );
  }

  return data;
}

export { PHONE_COOKIE_NAME };