"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewListingPage() {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [assetType, setAssetType] = useState("channel");
  const [price, setPrice] = useState<number>(0);
  const [msg, setMsg] = useState("");

  const onCreate = async () => {
    setMsg("");

    const { data: sessionRes } = await supabase.auth.getSession();
    const token = sessionRes.session?.access_token;
    if (!token) return setMsg("로그인 먼저 필요");

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        platform,
        asset_type: assetType,
        price_krw: price,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setMsg(json.error ?? "생성 실패");
    setMsg(`생성됨: listing #${json.data.id}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>New Listing</h1>

      <div>Title</div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <div style={{ marginTop: 12 }}>Platform</div>
      <input value={platform} onChange={(e) => setPlatform(e.target.value)} />

      <div style={{ marginTop: 12 }}>Asset Type</div>
      <input value={assetType} onChange={(e) => setAssetType(e.target.value)} />

      <div style={{ marginTop: 12 }}>Price (KRW)</div>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      <div style={{ marginTop: 16 }}>
        <button onClick={onCreate}>등록</button>
      </div>

      <p>{msg}</p>
    </div>
  );
}