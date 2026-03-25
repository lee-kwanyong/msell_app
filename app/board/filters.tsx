"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_GROUPS } from "@/lib/catalog/assets"; // ✅ 여기 중요

type BoardType = "sell" | "buy";

export default function BoardFilters(props: {
  type: BoardType;
  q: string;
  platform: string;
  min: string;
  max: string;
}) {
  const router = useRouter();

  const [q, setQ] = useState(props.q ?? "");
  const [platform, setPlatform] = useState(props.platform ?? "all");
  const [min, setMin] = useState(props.min ?? "");
  const [max, setMax] = useState(props.max ?? "");

  const minOk = useMemo(() => min.trim() === "" || !Number.isNaN(Number(min)), [min]);
  const maxOk = useMemo(() => max.trim() === "" || !Number.isNaN(Number(max)), [max]);
  const canApply = minOk && maxOk;

  function buildUrl() {
    const sp = new URLSearchParams();
    sp.set("type", props.type);

    const qq = q.trim();
    const pf = platform.trim() || "all";
    const mn = min.trim();
    const mx = max.trim();

    if (qq) sp.set("q", qq);
    if (pf !== "all") sp.set("platform", pf);
    if (mn) sp.set("min", mn);
    if (mx) sp.set("max", mx);

    return `/board?${sp.toString()}`;
  }

  function onReset() {
    setQ("");
    setPlatform("all");
    setMin("");
    setMax("");
    router.push(`/board?type=${props.type}`);
    router.refresh();
  }

  function onApply() {
    if (!canApply) {
      alert("최소/최대 가격은 숫자만 입력해 주세요.");
      return;
    }
    const url = buildUrl();
    router.push(url);
    router.refresh();
  }

  return (
    <form
      className="formPanel"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      {/* ✅ 이게 보여야 반영된 거임 */}
      <div style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
        FILTERS FILE LOADED
      </div>

      <div className="formRow">
        <div>
          <div className="label">검색</div>
          <input
            className="input"
            placeholder="예) 수익, 구독자, 팔로워, niche"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div>
          <div className="label">플랫폼</div>
          <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All</option>

            {PLATFORM_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="inline2">
          <div>
            <div className="label">최소가격</div>
            <input className="input" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div>
            <div className="label">최대가격</div>
            <input className="input" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>

        <div className="btnRow" style={{ marginTop: 6 }}>
          <button type="button" className="btn" onClick={onReset} style={{ flex: 1 }}>
            초기화
          </button>
          <button type="submit" className="btn btnPrimary" style={{ flex: 1 }} disabled={!canApply}>
            적용
          </button>
        </div>
      </div>
    </form>
  );
}