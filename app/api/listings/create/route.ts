import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectWithError(message: string) {
  return NextResponse.redirect(
    new URL(
      `/listings/create?error=${encodeURIComponent(message)}`,
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    { status: 303 }
  );
}

function redirectTo(path: string) {
  return NextResponse.redirect(
    new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    { status: 303 }
  );
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo("/auth/login?next=/listings/create");
  }

  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const transferMethod = String(formData.get("transfer_method") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
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

  if (!title || !category || !priceRaw || !transferMethod || !descriptionRaw) {
    return redirectWithError("필수 항목이 누락되었습니다.");
  }

  if (!allowedStatus.has(status)) {
    return redirectWithError("상태 값이 올바르지 않습니다.");
  }

  const price = Number(priceRaw);

  if (!Number.isFinite(price) || price < 0) {
    return redirectWithError("가격은 0 이상의 숫자로 입력해주세요.");
  }

  const description = `[이전 방식] ${transferMethod}\n\n${descriptionRaw}`;

  const basePayload = {
    user_id: user.id,
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
    },
    {
      ...basePayload,
    },
  ];

  let insertedRow:
    | {
        id?: string | number;
        [key: string]: unknown;
      }
    | null = null;

  let lastError: string | null = null;

  for (const payload of candidatePayloads) {
    const { data, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("*")
      .single();

    if (!error && data) {
      insertedRow = data;
      lastError = null;
      break;
    }

    lastError = error?.message ?? "insert_failed";
  }

  if (!insertedRow?.id) {
    return redirectWithError(
      lastError === "insert_failed"
        ? "매물 등록에 실패했습니다."
        : `매물 등록 실패: ${lastError}`
    );
  }

  return redirectTo(
    `/listings/${insertedRow.id}?success=${encodeURIComponent("매물이 등록되었습니다.")}`
  );
}