import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
    mid: string;
  }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { id, mid } = await context.params;

  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const form = await req.formData();
  const evidence_text = String(form.get("evidence_text") ?? "").trim();

  if (!evidence_text) {
    return NextResponse.redirect(new URL(`/deal/${id}`, req.url));
  }

  const { error } = await supabase
    .from("deal_milestones")
    .update({
      status: "submitted",
      evidence_text,
    })
    .eq("id", mid)
    .eq("deal_id", id);

  if (error) {
    return NextResponse.redirect(new URL(`/deal/${id}`, req.url));
  }

  return NextResponse.redirect(new URL(`/deal/${id}`, req.url));
}