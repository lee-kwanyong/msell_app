"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DealRoom = {
  thread_id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  thread_status: string;

  title: string;
  platform: string | null;
  platform_key: string | null;
  asset_type: string | null;
  transfer_method: string | null;
  country: string | null;
  listing_locale: string | null;
  listing_status: string;
  review_status: string | null;
  allow_offers: boolean | null;
  guidance_min_krw: number | null;
  guidance_max_krw: number | null;

  deal_id: string | null;
  deal_status: string | null;
  escrow_status: string | null;
  deposit_amount_krw: number | null;
  nda_required: boolean | null;
  handover_window_days: number | null;

  last_offer_id: string | null;
  last_offer_price_krw: number | null;
  last_offer_status: string | null;
  last_offer_created_at: string | null;
};

type Offer = {
  id: string;
  thread_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_krw: number;
  structure: string | null;
  terms: unknown;
  status: string;
  created_at: string;
};

type Msg = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatKRW(v: number | null | undefined) {
  if (v == null) return "-";
  return new Intl.NumberFormat("ko-KR").format(v) + "원";
}

function parseNumberLoose(input: string) {
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function DealRoomPage() {
  const params = useParams();
  const router = useRouter();

  const threadId = useMemo(
    () => normalizeSingleParam((params as { threadId?: string | string[] })?.threadId),
    [params]
  );

  const [authChecked, setAuthChecked] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  const [room, setRoom] = useState<DealRoom | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [offerPrice, setOfferPrice] = useState("");
  const [offerStructure, setOfferStructure] = useState("Escrow + staged transfer");
  const [offerTerms, setOfferTerms] = useState('{"handover_days":7}');
  const [chatBody, setChatBody] = useState("");

  const reqSeq = useRef(0);

  const isSeller = useMemo(() => (room && me ? room.seller_id === me : false), [room, me]);
  const isBuyer = useMemo(() => (room && me ? room.buyer_id === me : false), [room, me]);

  const load = useCallback(async () => {
    const mySeq = ++reqSeq.current;

    setLoading(true);
    setErr(null);

    if (!threadId) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setAuthChecked(true);
      setLoading(false);
      setErr("유효하지 않은 thread 입니다.");
      return;
    }

    if (!isUuid(threadId)) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setAuthChecked(true);
      setLoading(false);
      setErr("잘못된 Deal Room 주소입니다. 실제 thread_id(uuid)가 필요합니다.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (mySeq !== reqSeq.current) return;

    if (sessionError) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setMe(null);
      setAuthChecked(true);
      setLoading(false);
      setErr(sessionError.message);
      return;
    }

    if (!session?.user) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setMe(null);
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    setMe(session.user.id);
    setAuthChecked(true);

    const { data: roomData, error: roomErr } = await supabase.rpc("get_deal_room", {
      p_thread_id: threadId,
    });

    if (mySeq !== reqSeq.current) return;

    if (roomErr) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setLoading(false);
      setErr(roomErr.message);
      return;
    }

    const nextRoom = Array.isArray(roomData) && roomData.length > 0 ? (roomData[0] as DealRoom) : null;

    if (!nextRoom) {
      setRoom(null);
      setOffers([]);
      setMsgs([]);
      setLoading(false);
      setErr("접근 권한이 없거나 존재하지 않는 thread 입니다.");
      return;
    }

    setRoom(nextRoom);

    const [{ data: offersData, error: offersErr }, { data: msgData, error: msgErr }] =
      await Promise.all([
        supabase.rpc("get_thread_offers", { p_thread_id: threadId }),
        supabase.rpc("get_thread_messages", { p_thread_id: threadId }),
      ]);

    if (mySeq !== reqSeq.current) return;

    if (offersErr) {
      setOffers([]);
      setMsgs([]);
      setLoading(false);
      setErr(offersErr.message);
      return;
    }

    if (msgErr) {
      setOffers([]);
      setMsgs([]);
      setLoading(false);
      setErr(msgErr.message);
      return;
    }

    setOffers(Array.isArray(offersData) ? (offersData as Offer[]) : []);
    setMsgs(Array.isArray(msgData) ? (msgData as Msg[]) : []);
    setLoading(false);
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [load]);

  useEffect(() => {
    if (!threadId || !me || !isUuid(threadId)) return;

    const ch = supabase
      .channel(`deal_room_${threadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        () => {
          load();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers", filter: `thread_id=eq.${threadId}` },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [threadId, me, load]);

  async function submitOffer() {
    if (!room || !isBuyer) return;

    setErr(null);

    const price = parseNumberLoose(offerPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setErr("가격을 숫자로 입력하세요. (예: 15000000)");
      return;
    }

    let termsObj: Record<string, unknown> = {};
    try {
      termsObj = offerTerms ? JSON.parse(offerTerms) : {};
    } catch {
      setErr("terms는 JSON 형식이어야 합니다.");
      return;
    }

    const { data, error } = await supabase.rpc("create_offer", {
      p_listing_id: room.listing_id,
      p_price_krw: price,
      p_structure: offerStructure || null,
      p_terms: termsObj,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    const newOfferId = Array.isArray(data) ? (data?.[0]?.offer_id as string | undefined) : undefined;
    if (!newOfferId) {
      setErr("offer 생성 결과를 확인할 수 없습니다.");
      return;
    }

    setOfferPrice("");
    await load();
  }

  async function accept(offerId: string) {
    setErr(null);
    const { error } = await supabase.rpc("accept_offer", { p_offer_id: offerId });
    if (error) {
      setErr(error.message);
      return;
    }
    await load();
  }

  async function reject(offerId: string) {
    setErr(null);
    const { error } = await supabase.rpc("reject_offer", { p_offer_id: offerId });
    if (error) {
      setErr(error.message);
      return;
    }
    await load();
  }

  async function counter(offerId: string) {
    if (!isSeller) return;

    setErr(null);

    const price = parseNumberLoose(offerPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setErr("카운터 가격을 숫자로 입력하세요.");
      return;
    }

    let termsObj: Record<string, unknown> = {};
    try {
      termsObj = offerTerms ? JSON.parse(offerTerms) : {};
    } catch {
      setErr("terms는 JSON 형식이어야 합니다.");
      return;
    }

    const { error } = await supabase.rpc("counter_offer", {
      p_offer_id: offerId,
      p_new_price_krw: price,
      p_structure: offerStructure || null,
      p_terms: termsObj,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setOfferPrice("");
    await load();
  }

  async function withdraw(offerId: string) {
    setErr(null);
    const { error } = await supabase.rpc("withdraw_offer", { p_offer_id: offerId });
    if (error) {
      setErr(error.message);
      return;
    }
    await load();
  }

  async function sendMessage() {
    if (!room || !me) return;

    setErr(null);

    const body = chatBody.trim();
    if (!body) return;

    const { error } = await supabase.from("messages").insert({
      thread_id: room.thread_id,
      sender_id: me,
      body,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setChatBody("");
    await load();
  }

  if (!authChecked || loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="text-sm text-gray-500">로딩중...</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border p-6 space-y-4">
          <div className="text-2xl font-semibold">Deal Room</div>
          <div className="text-sm text-gray-600">이 거래방을 보려면 로그인해야 합니다.</div>
          <div className="flex gap-2">
            <Link
              href={`/auth/login?next=${encodeURIComponent(`/deal-room/${threadId}`)}`}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              로그인
            </Link>
            <Link
              href="/board?type=sell"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              보드로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (err && !room) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border p-6 space-y-4">
          <div className="text-2xl font-semibold">Deal Room</div>
          <div className="text-sm text-red-600">{err}</div>
          <div className="flex gap-2">
            <button
              onClick={() => load()}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              새로고침
            </button>
            <button
              onClick={() => router.push("/inbox")}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Inbox
            </button>
            <button
              onClick={() => router.push("/board?type=sell")}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              보드로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/inbox")}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Inbox
          </button>
          <h1 className="mt-2 text-2xl font-semibold">Deal Room</h1>
        </div>
        <button onClick={load} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
          새로고침
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {room && (
        <>
          <div className="rounded-2xl border p-4 space-y-2">
            <div className="font-medium">{room.title}</div>
            <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
              <span>platform: {room.platform_key || room.platform || "-"}</span>
              <span>asset: {room.asset_type || "-"}</span>
              <span>listing: {room.listing_status}</span>
              <span>thread: {room.thread_status}</span>
              <span>deal: {room.deal_status || "-"}</span>
              <span>escrow: {room.escrow_status || "-"}</span>
              <span>
                guidance: {formatKRW(room.guidance_min_krw)} ~ {formatKRW(room.guidance_max_krw)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Offers</div>
                <div className="text-xs text-gray-500">
                  {isSeller ? "Seller" : isBuyer ? "Buyer" : "Participant"}
                </div>
              </div>

              <div className="grid gap-2">
                {offers.map((o) => (
                  <div key={o.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{formatKRW(o.price_krw)}</div>
                        <div className="mt-1 text-xs text-gray-500 break-words">
                          {o.structure || "-"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          status: {o.status} · {new Date(o.created_at).toLocaleString("ko-KR")}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {isSeller && o.status === "active" && (
                          <>
                            <button
                              onClick={() => accept(o.id)}
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => reject(o.id)}
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => counter(o.id)}
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Counter
                            </button>
                          </>
                        )}

                        {isBuyer && o.status === "active" && o.buyer_id === me && (
                          <button
                            onClick={() => withdraw(o.id)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {offers.length === 0 && (
                  <div className="text-sm text-gray-500">아직 오퍼가 없습니다.</div>
                )}
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="text-sm font-semibold">
                  {isBuyer ? "New Offer" : "Counter Input"}
                </div>

                <div className="grid gap-2">
                  <input
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="가격(KRW) 예: 15000000"
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                  <input
                    value={offerStructure}
                    onChange={(e) => setOfferStructure(e.target.value)}
                    placeholder="structure"
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                  <textarea
                    value={offerTerms}
                    onChange={(e) => setOfferTerms(e.target.value)}
                    placeholder='terms JSON 예: {"handover_days":7}'
                    className="w-full rounded-xl border px-3 py-2 text-sm min-h-[90px]"
                  />

                  {isBuyer ? (
                    <button
                      onClick={submitOffer}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Submit Offer
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Seller는 위 오퍼 카드에서 Counter 버튼을 눌러 카운터를 생성합니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 space-y-3">
              <div className="font-semibold">Messages</div>

              <div className="rounded-xl border p-3 h-[420px] overflow-auto space-y-2">
                {msgs.map((m) => (
                  <div key={m.id} className="text-sm">
                    <div className="text-xs text-gray-500">
                      {m.sender_id === me ? "Me" : m.sender_id} ·{" "}
                      {new Date(m.created_at).toLocaleString("ko-KR")}
                    </div>
                    <div className="whitespace-pre-wrap">{m.body}</div>
                  </div>
                ))}
                {msgs.length === 0 && (
                  <div className="text-sm text-gray-500">아직 메시지가 없습니다.</div>
                )}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={chatBody}
                  onChange={(e) => setChatBody(e.target.value)}
                  placeholder="메시지 입력"
                  className="w-full rounded-xl border px-3 py-2 text-sm min-h-[60px]"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 h-[60px]"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}