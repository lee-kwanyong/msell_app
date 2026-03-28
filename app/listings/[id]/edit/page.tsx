import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function toQueryString(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params.toString();
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceNegotiableRaw = String(formData.get("price_negotiable") ?? "false").trim();
  const transferMethod = String(formData.get("transfer_method") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

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

  const queryBase = {
    title: encodeURIComponent(title),
    category: encodeURIComponent(category),
    price: encodeURIComponent(priceRaw),
    price_negotiable: encodeURIComponent(priceNegotiableRaw === "true" ? "true" : "false"),
    transfer_method: encodeURIComponent(transferMethod),
    description: encodeURIComponent(description),
    status: encodeURIComponent(status),
  };

  if (!title || !category || !priceRaw || !transferMethod || !description) {
    return NextResponse.redirect(
      new URL(
        `/listings/create?${toQueryString({
          ...queryBase,
          error: encodeURIComponent("필수 항목을 모두 입력해 주세요."),
        })}`,
        request.url
      ),
      303
    );
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.redirect(
      new URL(
        `/listings/create?${toQueryString({
          ...queryBase,
          error: encodeURIComponent("희망 가격을 올바르게 입력해 주세요."),
        })}`,
        request.url
      ),
      303
    );
  }

  if (!allowedStatus.has(status)) {
    return NextResponse.redirect(
      new URL(
        `/listings/create?${toQueryString({
          ...queryBase,
          error: encodeURIComponent("상태 값이 올바르지 않습니다."),
        })}`,
        request.url
      ),
      303
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(
      new URL("/auth/login?next=/listings/create", request.url),
      303
    );
  }

  const finalDescription = `[이전 방식] ${transferMethod}\n\n${description}`;
  const priceNegotiable = priceNegotiableRaw === "true";

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      title,
      category,
      price,
      price_negotiable: priceNegotiable,
      description: finalDescription,
      status,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return NextResponse.redirect(
      new URL(
        `/listings/create?${toQueryString({
          ...queryBase,
          error: encodeURIComponent(error?.message || "등록 중 오류가 발생했습니다."),
        })}`,
        request.url
      ),
      303
    );
  }

  return NextResponse.redirect(new URL(`/listings/${data.id}`, request.url), 303);
}