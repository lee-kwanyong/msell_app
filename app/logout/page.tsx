"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    })();
  }, [router]);

  return <div style={{ padding: 24 }}>Logging out...</div>;
}