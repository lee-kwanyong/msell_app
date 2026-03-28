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
    return redirectTo(request, "/auth/login?next=/board");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return redirectTo(
      request,
      `/board?error=${encodeURIComponent("관리자만 답변을 작성할 수 있습니다.")}`
    );
  }

  const formData = await request.formData();
  const postId = clean(formData.get("post_id"));
  const content = clean(formData.get("content"));

  if (!postId) {
    return redirectTo(
      request,
      `/board?error=${encodeURIComponent("게시글 정보를 찾을 수 없습니다.")}`
    );
  }

  if (!content) {
    return redirectTo(
      request,
      `/board/${postId}?error=${encodeURIComponent("답변 내용을 입력해 주세요.")}&reply=${encodeURIComponent(content)}`
    );
  }

  const { error: replyError } = await supabase.from("board_replies").insert({
    post_id: postId,
    admin_id: user.id,
    content,
  });

  if (replyError) {
    return redirectTo(
      request,
      `/board/${postId}?error=${encodeURIComponent(replyError.message)}&reply=${encodeURIComponent(content)}`
    );
  }

  await supabase
    .from("board_posts")
    .update({
      status: "answered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  return redirectTo(
    request,
    `/board/${postId}?success=${encodeURIComponent("답변이 등록되었습니다.")}`
  );
}