import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();

  const inquiry_type = String(formData.get("inquiry_type") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const company_name = String(formData.get("company_name") || "").trim();
  const contact_name = String(formData.get("contact_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone_number = String(formData.get("phone_number") || "").trim();
  const kakao_id = String(formData.get("kakao_id") || "").trim();
  const telegram_id = String(formData.get("telegram_id") || "").trim();
  const budget = String(formData.get("budget") || "").trim();
  const target_service = String(formData.get("target_service") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!inquiry_type || !title || !contact_name || !body) {
    return NextResponse.redirect(
      new URL(
        "/advertise/inquiry?error=" +
          encodeURIComponent("필수 항목이 비어 있습니다."),
        request.url
      ),
      { status: 303 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("ad_inquiries").insert({
    user_id: user?.id ?? null,
    inquiry_type,
    title,
    company_name: company_name || null,
    contact_name,
    email: email || null,
    phone_number: phone_number || null,
    kakao_id: kakao_id || null,
    telegram_id: telegram_id || null,
    budget: budget || null,
    target_service: target_service || null,
    body,
    status: "new",
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/advertise/inquiry?error=" + encodeURIComponent(error.message),
        request.url
      ),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL("/advertise/inquiry?success=1", request.url),
    { status: 303 }
  );
}