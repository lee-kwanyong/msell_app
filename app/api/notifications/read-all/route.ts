import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const origin = getOrigin(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent("/notifications")}`,
      { status: 303 }
    );
  }

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return NextResponse.redirect(`${origin}/notifications?read_all=1`, {
    status: 303,
  });
}