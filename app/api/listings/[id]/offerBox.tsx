"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  listingId: string;
};

function parseNumberLoose(input: string) {
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export default function OfferBox({ listingId }: Props) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [price, setPrice] = useState("");
  const [structure, setStructure] = useState("Escrow + staged transfer");
  const [terms, setTerms] = useState('{"handover_days":7}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    thread_id: string;
    offer_id: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const numericPrice = parseNumberLoose(price);

      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        throw new Error("가격을 올바르게 입력해줘.");
      }

      let parsedTerms: Record<string, any> = {};
      try {
        parsedTerms = terms ? JSON.parse(terms) : {};
      } catch {
        throw new Error("terms는 JSON 형식이어야 해.");
      }

      const { data: threadData, error: threadErr } = await supabase.rpc("create_thread", {
        p_listing_id: listingId,
      });

      if (threadErr) {
        throw new Error(threadErr.message);
      }

      const thread_id = Array.isArray(threadData)
        ? threadData[0]?.thread_id ?? null
        : null;

      if (!thread_id) {
        throw new Error("thread 생성 결과를 확인할 수 없어.");
      }

      const { data: offerData, error: offerErr } = await supabase.rpc("create_offer", {
        p_listing_id: listingId,
        p_price_krw: numericPrice,
        p_structure: structure,
        p_terms: parsedTerms,
      });

      if (offerErr) {
        throw new Error(offerErr.message);
      }

      const offer_id = Array.isArray(offerData)
        ? offerData[0]?.offer_id ?? null
        : null;

      if (!offer_id) {
        throw new Error("offer 생성 결과를 확인할 수 없어.");
      }

      setResult({ thread_id, offer_id });
      router.push(`/deal/${thread_id}`);
    } catch (e: any) {
      setError(e?.message ?? "오퍼 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Offer price (KRW)"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
        <button onClick={submit} disabled={loading} style={{ padding: "10px 14px" }}>
          {loading ? "Submitting..." : "Make Offer"}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          value={structure}
          onChange={(e) => setStructure(e.target.value)}
          placeholder="Deal structure"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder='{"handover_days":7}'
          style={{
            width: "100%",
            minHeight: 90,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
      </div>

      {error && <p style={{ marginTop: 10, color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 10 }}>
          <div>thread_id: {result.thread_id}</div>
          <div>offer_id: {result.offer_id}</div>
        </div>
      )}
    </div>
  );
}