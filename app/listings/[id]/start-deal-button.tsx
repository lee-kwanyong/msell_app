"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type StartDealButtonProps = {
  listingId: string;
  ownerId: string | null;
};

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Unknown error";

  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.error === "string" && e.error) return e.error;
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.details === "string" && e.details) return e.details;
    if (typeof e.hint === "string" && e.hint) return e.hint;
    if (typeof e.code === "string" && e.code) return `Error code: ${e.code}`;
    try {
      return JSON.stringify(e, null, 2);
    } catch {
      return "Unknown object error";
    }
  }

  return "Unknown error";
}

export default function StartDealButton({
  listingId,
  ownerId,
}: StartDealButtonProps) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [startingDeal, setStartingDeal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartDeal() {
    if (startingDeal) return;

    try {
      setStartingDeal(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        router.push(`/auth/login?next=/listings/${listingId}`);
        return;
      }

      if (!listingId) {
        throw new Error("Listing ID is missing.");
      }

      if (!ownerId) {
        throw new Error("Listing owner is missing.");
      }

      if (user.id === ownerId) {
        throw new Error("본인 글에는 딜을 시작할 수 없습니다.");
      }

      const response = await fetch("/api/deals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");

      const result = isJson ? await response.json().catch(() => null) : null;

      if (!response.ok) {
        throw new Error(result?.error || "딜 생성에 실패했습니다.");
      }

      const redirectTo =
        typeof result?.redirectTo === "string" ? result.redirectTo : null;

      if (!redirectTo) {
        throw new Error("생성 후 이동 경로를 받지 못했습니다.");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err);
      console.error("[StartDealButton] error:", message);
      setError(message);
    } finally {
      setStartingDeal(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleStartDeal}
        disabled={startingDeal}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {startingDeal ? "처리 중..." : "딜 시작"}
      </button>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}