import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildDescription(transferMethod: string, description: string) {
  if (transferMethod && description) {
    return `[이전 방식] ${transferMethod}\n\n${description}`;
  }

  if (transferMethod) {
    return `[이전 방식] ${transferMethod}`;
  }

  return description;
}

function createRelativeRedirect(path: string) {
  return NextResponse.redirect(path, { status: 303 });
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return createRelativeRedirect("/auth/login");
  }

  const formData = await request.formData();

  const id = clean(formData.get("id"));
  const title = clean(formData.get("title"));
  const category = clean(formData.get("category"));
  const priceRaw = clean(formData.get("price"));
  const transferMethod = clean(formData.get("transfer_method"));
  const descriptionRaw = clean(formData.get("description"));
  const status = clean(formData.get("status")) || "active";

  if (!id) {
    return createRelativeRedirect(
      `/my/listings?error=${encodeURIComponent("수정할 자산 정보를 찾을 수 없습니다.")}`
    );
  }

  const returnQuery = new URLSearchParams({
    title,
    category,
    price: priceRaw,
    transfer_method: transferMethod,
    description: descriptionRaw,
    status,
  });

  if (!title || !category || !priceRaw) {
    return createRelativeRedirect(
      `/listings/${id}/edit?error=${encodeURIComponent(
        "제목, 카테고리, 희망 가격은 필수입니다."
      )}&${returnQuery.toString()}`
    );
  }

  const price = Number(priceRaw);

  if (!Number.isFinite(price) || price < 0) {
    return createRelativeRedirect(
      `/listings/${id}/edit?error=${encodeURIComponent(
        "희망 가격은 0 이상의 숫자로 입력해 주세요."
      )}&${returnQuery.toString()}`
    );
  }

  const { data: existingListing, error: existingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (existingError || !existingListing) {
    return createRelativeRedirect(
      `/my/listings?error=${encodeURIComponent("자산 정보를 찾을 수 없습니다.")}`
    );
  }

  const sellerId =
    existingListing.seller_id ??
    existingListing.user_id ??
    existingListing.owner_id ??
    existingListing.profile_id ??
    null;

  if (sellerId && sellerId !== user.id) {
    return createRelativeRedirect(
      `/my/listings?error=${encodeURIComponent("수정 권한이 없습니다.")}`
    );
  }

  const description = buildDescription(transferMethod, descriptionRaw);

  const payload = {
    title,
    category,
    price,
    description: description || null,
    status,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("listings")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return createRelativeRedirect(
      `/listings/${id}/edit?error=${encodeURIComponent(updateError.message)}&${returnQuery.toString()}`
    );
  }

  return createRelativeRedirect(
    `/listings/${id}?success=${encodeURIComponent("매물이 수정되었습니다.")}`
  );
}