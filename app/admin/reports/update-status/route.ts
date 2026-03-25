import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/admin";
  return value;
}

function safeStatus(value: string | null | undefined) {
  if (value === "pending") return "pending";
  if (value === "reviewing") return "reviewing";
  if (value === "resolved") return "resolved";
  if (value === "rejected") return "rejected";
  return null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const reportIdRaw = formData.get("report_id");
  const statusRaw = formData.get("status");
  const returnToRaw = formData.get("return_to");

  const reportId = typeof reportIdRaw === "string" ? reportIdRaw.trim() : "";
  const status = typeof statusRaw === "string" ? safeStatus(statusRaw.trim()) : null;
  const returnTo =
    typeof returnToRaw === "string" ? safeReturnTo(returnToRaw.trim()) : "/admin";

  if (!reportId || !status) {
    return redirectTo(request, `${returnTo}?error=invalid_status`);
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, `/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!me || me.role !== "admin") {
    return redirectTo(request, `${returnTo}?error=forbidden`);
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) {
    return redirectTo(request, `${returnTo}?error=report_not_found`);
  }

  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (error) {
    console.error("admin report status update failed:", error);
    return redirectTo(request, `${returnTo}?error=update_failed`);
  }

  return redirectTo(request, `${returnTo}?success=report_updated`);
}