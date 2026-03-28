import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function normalizeStatus(input: string) {
  const raw = input.trim().toLowerCase();

  const map: Record<string, string> = {
    active: "active",
    draft: "draft",
    hidden: "hidden",
    sold: "sold",
    closed: "sold",
    reserved: "reserved",
    pending_review: "pending_review",
    rejected: "rejected",
    archived: "archived",
    "거래가능": "active",
    "임시저장": "draft",
    "숨김": "hidden",
    "거래종료": "sold",
    "예약중": "reserved",
    "검토중": "pending_review",
    "반려": "rejected",
    "보관": "archived",
  };

  return map[raw] || raw || "active";
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

function buildEditUrl(
  id: string,
  error: string,
  values: {
    title?: string;
    category?: string;
    price?: string;
    transfer_method?: string;
    description?: string;
    status?: string;
  }
) {
  const qs = new URLSearchParams();

  if (error) qs.set("error", error);
  if (values.title) qs.set("title", values.title);
  if (values.category) qs.set("category", values.category);
  if (values.price) qs.set("price", values.price);
  if (values.transfer_method) qs.set("transfer_method", values.transfer_method);
  if (values.description) qs.set("description", values.description);
  if (values.status) qs.set("status", values.status);

  return `/listings/${id}/edit?${qs.toString()}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return redirectTo(request, "/auth/login?next=/my/listings");
    }

    const formData = await request.formData();

    const id = clean(formData.get("id"));
    const title = clean(formData.get("title"));
    const category = clean(formData.get("category"));
    const priceRaw = clean(formData.get("price"));
    const transferMethod = clean(formData.get("transfer_method"));
    const descriptionRaw = clean(formData.get("description"));
    const status = normalizeStatus(clean(formData.get("status")));

    if (!id) {
      return redirectTo(
        request,
        `/my/listings?error=${encodeURIComponent("수정할 자산 정보를 찾을 수 없습니다.")}`
      );
    }

    const returnValues = {
      title,
      category,
      price: priceRaw,
      transfer_method: transferMethod,
      description: descriptionRaw,
      status,
    };

    if (!title || !category || !priceRaw) {
      return redirectTo(
        request,
        buildEditUrl(id, "제목, 카테고리, 희망 가격은 필수입니다.", returnValues)
      );
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      return redirectTo(
        request,
        buildEditUrl(id, "희망 가격은 0 이상의 숫자로 입력해 주세요.", returnValues)
      );
    }

    const allowedStatuses = new Set([
      "draft",
      "pending_review",
      "active",
      "reserved",
      "sold",
      "hidden",
      "rejected",
      "archived",
    ]);

    if (!allowedStatuses.has(status)) {
      return redirectTo(
        request,
        buildEditUrl(id, `지원하지 않는 상태값입니다: ${status}`, returnValues)
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (listingError || !listing) {
      return redirectTo(
        request,
        `/my/listings?error=${encodeURIComponent("자산 정보를 찾을 수 없습니다.")}`
      );
    }

    const ownerId =
      listing.seller_id ||
      listing.user_id ||
      listing.owner_id ||
      listing.profile_id ||
      null;

    if (ownerId && ownerId !== user.id) {
      return redirectTo(
        request,
        `/my/listings?error=${encodeURIComponent("수정 권한이 없습니다.")}`
      );
    }

    const payload = {
      title,
      category,
      price,
      description: buildDescription(transferMethod, descriptionRaw) || null,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", id)
      .select("id, status")
      .single();

    if (updateError || !updated?.id) {
      return redirectTo(
        request,
        buildEditUrl(
          id,
          updateError?.message || "매물 수정에 실패했습니다.",
          returnValues
        )
      );
    }

    return redirectTo(
      request,
      `/listings/${id}?success=${encodeURIComponent("매물이 수정되었습니다.")}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown_update_error";

    const formData = await request.formData().catch(() => null);
    const id = clean(formData?.get("id") ?? null);

    if (id) {
      return redirectTo(
        request,
        `/listings/${id}/edit?error=${encodeURIComponent(`수정 중 오류가 발생했습니다: ${message}`)}`
      );
    }

    return redirectTo(
      request,
      `/my/listings?error=${encodeURIComponent(`수정 중 오류가 발생했습니다: ${message}`)}`
    );
  }
}