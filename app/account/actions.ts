"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const fullName = clean(formData.get("full_name"));
  const username = clean(formData.get("username"));
  const phoneNumber = normalizePhone(clean(formData.get("phone_number")));

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName || null,
      username: username || null,
      phone_number: phoneNumber || null,
    },
    { onConflict: "id" }
  );

  if (error) {
    redirect(
      `/account?error=${encodeURIComponent(
        error.message || "계정 저장에 실패했습니다."
      )}`
    );
  }

  redirect("/");
}