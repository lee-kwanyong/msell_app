import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireAuth() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return user;
}