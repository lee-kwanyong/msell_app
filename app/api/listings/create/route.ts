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

function toCreateRedirectURL(
  request: Request,
  params: Record<string, string>
) {
  const url = new URL("/listings/create", request.url);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/auth/login?next=/listings/create", request.url),
      { status: 303 }
    );
  }

  const formData = await request.formData();

  const title = clean(formData.get("title"));
  const category = clean(formData.get("category"));
  const priceRaw = clean(formData.get("price"));
  const transferMethod = clean(formData.get("transfer_method"));
  const descriptionRaw = clean(formData.get("description"));
  const status = clean(formData.get("status")) || "active";

  const returnParams = {
    title,
    category,
    price: priceRaw,
    transfer_method: transferMethod,
    description: descriptionRaw,
    status,
  };

  if (!title || !category || !priceRaw) {
    const url = toCreateRedirectURL(request, {
      ...returnParams,
      error: "제목, 카테고리, 희망 가격은 필수입니다.",
    });

    return NextResponse.redirect(url, { status: 303 });
  }

  const price = Number(priceRaw);

  if (!Number.isFinite(price) || price < 0) {
    const url = toCreateRedirectURL(request, {
      ...returnParams,
      error: "희망 가격은 0 이상의 숫자로 입력해 주세요.",
    });

    return NextResponse.redirect(url, { status: 303 });
  }

  const description = buildDescription(transferMethod, descriptionRaw);
  const sellerId = user.id;

  if (!sellerId) {
    const url = toCreateRedirectURL(request, {
      ...returnParams,
      error: "로그인 사용자 정보를 확인할 수 없습니다.",
    });

    return NextResponse.redirect(url, { status: 303 });
  }

  const payload = {
    seller_id: sellerId,
    title,
    category,
    price,
    description: description || null,
    status,
  };

  const { data, error } = await supabase
    .from("listings")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    const url = toCreateRedirectURL(request, {
      ...returnParams,
      error:
        error.message?.includes("seller_id")
          ? "판매자 정보 연결에 실패했습니다. 현재 로그인 상태를 다시 확인해 주세요."
          : error.message,
    });

    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.redirect(new URL(`/listings/${data.id}`, request.url), {
    status: 303,
  });
}