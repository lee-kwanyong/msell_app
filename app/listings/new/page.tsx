"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function parseNumberLoose(input: string) {
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("x_account");
  const [platformKey, setPlatformKey] = useState("x");
  const [platform, setPlatform] = useState("X");
  const [transferMethod, setTransferMethod] = useState("");
  const [country, setCountry] = useState("KR");
  const [listingLocale, setListingLocale] = useState("ko-KR");
  const [priceKrw, setPriceKrw] = useState("");
  const [guidanceMinKrw, setGuidanceMinKrw] = useState("");
  const [guidanceMaxKrw, setGuidanceMaxKrw] = useState("");
  const [allowOffers, setAllowOffers] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      !!title.trim() &&
      !!assetType.trim() &&
      !!platformKey.trim() &&
      !loading
    );
  }, [title, assetType, platformKey, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);

    if (!title.trim()) {
      setErr("제목을 입력하세요.");
      return;
    }

    const asking = priceKrw.trim() ? parseNumberLoose(priceKrw) : null;
    const guideMin = guidanceMinKrw.trim()
      ? parseNumberLoose(guidanceMinKrw)
      : null;
    const guideMax = guidanceMaxKrw.trim()
      ? parseNumberLoose(guidanceMaxKrw)
      : null;

    if (asking !== null && (!Number.isFinite(asking) || asking <= 0)) {
      setErr("희망가는 숫자로 입력하세요.");
      return;
    }

    if (guideMin !== null && (!Number.isFinite(guideMin) || guideMin <= 0)) {
      setErr("가이드 최소가는 숫자로 입력하세요.");
      return;
    }

    if (guideMax !== null && (!Number.isFinite(guideMax) || guideMax <= 0)) {
      setErr("가이드 최대가는 숫자로 입력하세요.");
      return;
    }

    if (
      guideMin !== null &&
      guideMax !== null &&
      Number.isFinite(guideMin) &&
      Number.isFinite(guideMax) &&
      guideMin > guideMax
    ) {
      setErr("가이드 최소가는 최대가보다 클 수 없습니다.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setErr(userError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      router.push(`/auth/login?next=${encodeURIComponent("/listings/new")}`);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      asset_type: assetType.trim(),
      platform_key: platformKey.trim(),
      platform: platform.trim() || null,
      transfer_method: transferMethod.trim() || null,
      country: country.trim() || null,
      listing_locale: listingLocale.trim() || null,
      price_krw: asking,
      guidance_min_krw: guideMin,
      guidance_max_krw: guideMax,
      allow_offers: allowOffers,
      listing_status: "active",
      review_status: "approved",
      seller_id: user.id,
      owner_id: user.id,
      user_id: user.id,
      status: "open",
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    setLoading(false);
    router.push(`/listings/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <button
          onClick={() => router.push("/board?type=sell")}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Board
        </button>
        <h1 className="mt-2 text-2xl font-semibold">Create Listing</h1>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4">
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 수익화 완료 X 계정 판매"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="계정 상태, 국가, 수익 구조, 이전 방식 등을 입력"
              className="min-h-[140px] w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Asset Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="x_account">X Account</option>
              <option value="instagram_account">Instagram Account</option>
              <option value="youtube_channel">YouTube Channel</option>
              <option value="telegram_channel">Telegram Channel</option>
              <option value="website">Website</option>
              <option value="domain">Domain</option>
              <option value="digital_asset">Digital Asset</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Platform Key</label>
            <input
              value={platformKey}
              onChange={(e) => setPlatformKey(e.target.value)}
              placeholder="예: x, instagram, youtube"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Platform Name</label>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="예: X"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Transfer Method</label>
            <input
              value={transferMethod}
              onChange={(e) => setTransferMethod(e.target.value)}
              placeholder="예: admin_transfer, owner_transfer"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="예: KR"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Listing Locale</label>
            <input
              value={listingLocale}
              onChange={(e) => setListingLocale(e.target.value)}
              placeholder="예: ko-KR"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">희망가 (KRW)</label>
            <input
              value={priceKrw}
              onChange={(e) => setPriceKrw(e.target.value)}
              placeholder="예: 25000000"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">가이드 최소가 (KRW)</label>
            <input
              value={guidanceMinKrw}
              onChange={(e) => setGuidanceMinKrw(e.target.value)}
              placeholder="예: 20000000"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">가이드 최대가 (KRW)</label>
            <input
              value={guidanceMaxKrw}
              onChange={(e) => setGuidanceMaxKrw(e.target.value)}
              placeholder="예: 30000000"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowOffers}
              onChange={(e) => setAllowOffers(e.target.checked)}
            />
            오퍼 허용
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/board?type=sell")}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}