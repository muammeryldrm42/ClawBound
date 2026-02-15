"use client";

import Sidebar from "@/components/Sidebar";
import TopStats from "@/components/TopStats";
import ControlBar, { HomeTab, RankBy, Timeframe, Category } from "@/components/ControlBar";
import TokenTable, { ColumnKey } from "@/components/TokenTable";
import { Suspense, useEffect, useMemo, useState } from "react";
import { fetchHomeList } from "@/lib/clientApi";
import { useSearchParams, useRouter } from "next/navigation";

const DEFAULT_COLUMNS: ColumnKey[] = ["token", "price", "change6h", "change24h", "liquidity", "volume24h", "mcap", "fdv"];

function HomeContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<HomeTab>((sp.get("tab") as HomeTab) || "trending");
  const [tf, setTf] = useState<Timeframe>((sp.get("tf") as Timeframe) || "6h");
  const [rankBy, setRankBy] = useState<RankBy>((sp.get("rank") as RankBy) || "volume");
  const [category, setCategory] = useState<Category>((sp.get("cat") as Category) || "all");

  const [columns, setColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);

  const queryKey = useMemo(() => ({ tab, tf, rankBy }), [tab, tf, rankBy]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("clawbound:focusSearch"));
      }
      if (e.key === "Escape") window.dispatchEvent(new CustomEvent("clawbound:closeSearch"));
      if (e.key === "1") setTf("5m");
      if (e.key === "2") setTf("1h");
      if (e.key === "3") setTf("6h");
      if (e.key === "4") setTf("24h");
      if (e.key.toLowerCase() === "g") setTab("gainers");
      if (e.key.toLowerCase() === "n") setTab("new");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("tf", tf);
    params.set("rank", rankBy);
    params.set("cat", category);
    router.replace(`/?${params.toString()}`);
  }, [tab, tf, rankBy, category, router]);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setErr(null);

    fetchHomeList(queryKey)
      .then((r) => {
        if (!alive) return;
        setRows(r.rows);
        setUpdatedAt(Date.now());
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load");
      })
      .finally(() => alive && setIsLoading(false));

    return () => { alive = false; };
  }, [queryKey]);

  const filtered = useMemo(() => {
    if (category === "all") return rows;
    return rows.filter((x) => x.tags?.includes(category));
  }, [rows, category]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <TopStats rows={rows} />

        <div className="mt-5">
          <ControlBar
            tab={tab}
            onTab={setTab}
            timeframe={tf}
            onTimeframe={setTf}
            rankBy={rankBy}
            onRankBy={setRankBy}
            category={category}
            onCategory={setCategory}
            updatedAt={updatedAt}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>

        <div className="mt-4">
          <TokenTable
            rows={filtered}
            loading={isLoading}
            error={err}
            columns={columns}
            onColumns={setColumns}
            filtersOpen={filtersOpen}
            onCloseFilters={() => setFiltersOpen(false)}
          />
        </div>

        <footer className="mt-8 text-xs text-white/40">
          Data powered by DexScreener • OHLCV by GeckoTerminal • Charts by TradingView Lightweight Charts • Powered by OpenClaw
        </footer>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-white/60">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
