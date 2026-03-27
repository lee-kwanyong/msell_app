"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function saveAccountAction(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const full_name = clean(formData.get("full_name"));
  const username = clean(formData.get("username"));
  const phone_number = clean(formData.get("phone_number"));
  const gender = clean(formData.get("gender"));

  const payload = {
    id: user.id,
    full_name: full_name || null,
    username: username || null,
    phone_number: phone_number || null,
    gender: gender || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.updateUser({
    data: {
      full_name: full_name || null,
      username: username || null,
      phone_number: phone_number || null,
      gender: gender || null,
    },
  });

  revalidatePath("/account");
  redirect("/account?saved=1");
}