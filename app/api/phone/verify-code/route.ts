import { NextRequest, NextResponse } from "next/server";
import {
  createPhoneVerificationCookieValue,
  isValidKoreanMobilePhone,
  normalizePhoneNumber,
  PHONE_COOKIE_NAME,
  sha256,
} from "@/lib/phone-verification";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhoneNumber = String(body?.phone_number || "");
    const rawCode = String(body?.code || "").trim();

    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);

    if (!isValidKoreanMobilePhone(phoneNumber)) {
      return NextResponse.json(
        { ok: false, error: "올바른 휴대폰 번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(rawCode)) {
      return NextResponse.json(
        { ok: false, error: "인증번호 6자리를 입력해 주세요." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const { data: row, error: selectError } = await supabase
      .from("phone_verifications")
      .select("id, code_hash, expires_at, verified_at, attempts")
      .eq("phone_number", phoneNumber)
      .eq("purpose", "signup")
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json(
        { ok: false, error: "인증 정보 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "먼저 인증번호를 발송해 주세요." },
        { status: 400 }
      );
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { ok: false, error: "인증번호가 만료되었습니다. 다시 요청해 주세요." },
        { status: 400 }
      );
    }

    const expectedHash = sha256(`${phoneNumber}:${rawCode}`);

    if (expectedHash !== row.code_hash) {
      await supabase
        .from("phone_verifications")
        .update({ attempts: (row.attempts || 0) + 1 })
        .eq("id", row.id);

      return NextResponse.json(
        { ok: false, error: "인증번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", row.id);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "인증 완료 처리에 실패했습니다." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "휴대폰 인증이 완료되었습니다.",
    });

    response.cookies.set(
      PHONE_COOKIE_NAME,
      createPhoneVerificationCookieValue(phoneNumber),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 30,
      }
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "인증 확인에 실패했습니다.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}