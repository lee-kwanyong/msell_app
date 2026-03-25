import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function makeAbsoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return new URL(path, base);
}

function redirectTo(path: string) {
  return NextResponse.redirect(makeAbsoluteUrl(path), { status: 303 });
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const formData = await request.formData();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const transferMethod = String(formData.get("transfer_method") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!id) {
    return redirectTo(
      `/listings?error=${encodeURIComponent("수정할 매물 ID가 없습니다.")}`
    );
  }

  if (!user) {
    return redirectTo(`/auth/login?next=/listings/${id}/edit`);
  }

  if (!title || !category || !priceRaw || !transferMethod || !descriptionRaw) {
    return redirectTo(
      `/listings/${id}/edit?error=${encodeURIComponent("필수 항목이 누락되었습니다.")}`
    );
  }

  const allowedStatus = new Set([
    "draft",
    "pending_review",
    "active",
    "reserved",
    "sold",
    "hidden",
    "rejected",
    "archived",
  ]);

  if (!allowedStatus.has(status)) {
    return redirectTo(
      `/listings/${id}/edit?error=${encodeURIComponent("상태 값이 올바르지 않습니다.")}`
    );
  }

  const price = Number(priceRaw);

  if (!Number.isFinite(price) || price < 0) {
    return redirectTo(
      `/listings/${id}/edit?error=${encodeURIComponent("가격은 0 이상의 숫자로 입력해주세요.")}`
    );
  }

  const { data: currentListing, error: fetchError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !currentListing) {
    return redirectTo(
      `/listings?error=${encodeURIComponent("매물을 찾을 수 없습니다.")}`
    );
  }

  if (String(currentListing.user_id ?? "") !== user.id) {
    return redirectTo(
      `/listings/${id}?error=${encodeURIComponent("수정 권한이 없습니다.")}`
    );
  }

  const description = `[이전 방식] ${transferMethod}\n\n${descriptionRaw}`;

  const basePayload = {
    title,
    category,
    price,
    status,
    description,
  };

  const candidatePayloads = [
    {
      ...basePayload,
      transfer_method: transferMethod,
      updated_at: new Date().toISOString(),
    },
    {
      ...basePayload,
      updated_at: new Date().toISOString(),
    },
    {
      ...basePayload,
      transfer_method: transferMethod,
    },
    {
      ...basePayload,
    },
  ];

  let success = false;
  let lastError = "매물 수정에 실패했습니다.";

  for (const payload of candidatePayloads) {
    const { error } = await supabase.from("listings").update(payload).eq("id", id);

    if (!error) {
      success = true;
      break;
    }

    lastError = error.message || lastError;
  }

  if (!success) {
    return redirectTo(
      `/listings/${id}/edit?error=${encodeURIComponent(`매물 수정 실패: ${lastError}`)}`
    );
  }

  return redirectTo(
    `/listings/${id}?success=${encodeURIComponent("매물이 수정되었습니다.")}`
  );
}