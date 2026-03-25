import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();

  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const admin_memo = String(formData.get("admin_memo") || "").trim();

  if (!id) {
    return NextResponse.redirect(new URL("/admin/ad-inquiries", request.url), {
      status: 303,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/login?next=/admin/ad-inquiries", request.url),
      { status: 303 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const payload: Record<string, string> = {};

  if (status) payload.status = status;
  payload.admin_memo = admin_memo;

  await supabase.from("ad_inquiries").update(payload).eq("id", id);

  return NextResponse.redirect(new URL("/admin/ad-inquiries", request.url), {
    status: 303,
  });
}