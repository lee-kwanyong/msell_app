"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type MyThread = {
  thread_id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  thread_status: string;
  title: string;
  platform: string | null;
  platform_key: string | null;
  asset_type: string | null;
  listing_status: string;
  updated_at: string;
  last_offer_price_krw: number | null;
  last_offer_status: string | null;
  last_message_at: string | null;
};

function formatKRW(v: number | null | undefined) {
  if (v == null) return "-";
  return new Intl.NumberFormat("ko-KR").format(v) + "원";
}

export default function InboxPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MyThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setErr(userErr.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase.rpc("get_my_threads");

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows((data as MyThread[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <button
          onClick={load}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          새로고침
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">로딩중...</div>}

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="grid gap-2">
        {rows.map((t) => (
          <button
            key={t.thread_id}
            onClick={() => router.push(`/deal/${t.thread_id}`)}
            className="text-left rounded-2xl border p-4 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{t.title}</div>
                <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
                  <span>platform: {t.platform_key || t.platform || "-"}</span>
                  <span>asset: {t.asset_type || "-"}</span>
                  <span>listing: {t.listing_status}</span>
                  <span>thread: {t.thread_status}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold">
                  {formatKRW(t.last_offer_price_krw)}
                </div>
                <div className="text-xs text-gray-500">
                  {t.last_offer_status ? `offer: ${t.last_offer_status}` : "offer: -"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(t.updated_at).toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
          </button>
        ))}

        {!loading && rows.length === 0 && (
          <div className="text-sm text-gray-500">아직 생성된 거래방이 없습니다.</div>
        )}
      </div>
    </div>
  );
}