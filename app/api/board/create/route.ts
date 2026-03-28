import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectTo(request, "/auth/login?next=/board/create");
  }

  const formData = await request.formData();
  const title = clean(formData.get("title"));
  const content = clean(formData.get("content"));

  const qs = new URLSearchParams({
    title,
    content,
  });

  if (!title || !content) {
    return redirectTo(
      request,
      `/board/create?error=${encodeURIComponent("제목과 내용을 입력해 주세요.")}&${qs.toString()}`
    );
  }

  const { data, error } = await supabase
    .from("board_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return redirectTo(
      request,
      `/board/create?error=${encodeURIComponent(error?.message || "게시글 등록에 실패했습니다.")}&${qs.toString()}`
    );
  }

  return redirectTo(
    request,
    `/board/${data.id}?success=${encodeURIComponent("게시글이 등록되었습니다.")}`
  );
}