import { NextRequest, NextResponse } from "next/server";
import {
  generateVerificationCode,
  isValidKoreanMobilePhone,
  normalizePhoneNumber,
  sendVerificationSms,
  sha256,
} from "@/lib/phone-verification";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhoneNumber = String(body?.phone_number || "");
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);

    if (!isValidKoreanMobilePhone(phoneNumber)) {
      return NextResponse.json(
        { ok: false, error: "올바른 휴대폰 번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();

    const { data: recentRows, error: recentError } = await supabase
      .from("phone_verifications")
      .select("id")
      .eq("phone_number", phoneNumber)
      .eq("purpose", "signup")
      .gte("created_at", threeMinutesAgo);

    if (recentError) {
      return NextResponse.json(
        { ok: false, error: "인증 요청 확인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if ((recentRows?.length || 0) >= 3) {
      return NextResponse.json(
        { ok: false, error: "잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();
    const codeHash = sha256(`${phoneNumber}:${code}`);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("phone_verifications").insert({
      phone_number: phoneNumber,
      purpose: "signup",
      code_hash: codeHash,
      expires_at: expiresAt,
      request_ip:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        null,
      user_agent: req.headers.get("user-agent"),
    });

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: "인증번호 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    await sendVerificationSms(phoneNumber, code);

    return NextResponse.json({
      ok: true,
      message: "인증번호를 발송했습니다.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "인증번호 발송에 실패했습니다.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}