import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await supabaseServer();

  // listings 테이블 접근 테스트(스키마 캐시/프로젝트 불일치 감지)
  const { error } = await supabase.from("listings").select("id").limit(1);

  return NextResponse.json({
    ok: !error,
    error: error?.message ?? null,
  });
}