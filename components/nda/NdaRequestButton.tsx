"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function NdaRequestButton({ listingId }: { listingId: string }) {
  const sb = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  async function request() {
    setLoading(true);
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) { window.location.href = "/login"; return; }

    const { error } = await sb.from("nda_requests").insert({
      listing_id: listingId,
      buyer_id: user.id,
      buyer_note: "NDA 요청"
    });

    setLoading(false);
    if (error) alert(error.message);
    else alert("NDA 요청을 보냈습니다.");
  }

  return (
    <button onClick={request} disabled={loading}>
      {loading ? "요청 중..." : "NDA 요청"}
    </button>
  );
}