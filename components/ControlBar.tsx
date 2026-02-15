"use client";

import { Filter, Settings2 } from "lucide-react";
import clsx from "clsx";
import { useMemo } from "react";

export type HomeTab = "trending" | "top" | "gainers" | "new";
export type Timeframe = "5m" | "1h" | "6h" | "24h";
export type RankBy = "trending" | "volume" | "liquidity";
export type Category = "all" | "pumpfun" | "bonkfun" | "ai";

function ago(ms: number) {
  if (!ms) return "—";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function ControlBar(props: {
  tab: HomeTab; onTab: (v: HomeTab) => void;
  timeframe: Timeframe; onTimeframe: (v: Timeframe) => void;
  rankBy: RankBy; onRankBy: (v: RankBy) => void;
  category: Category; onCategory: (v: Category) => void;
  updatedAt: number;
  onOpenFilters: () => void;
}) {
  const updated = useMemo(() => ago(props.updatedAt), [props.updatedAt]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0e13] p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-white/50 px-2">Last 24 hours</div>

        <div className="flex rounded-lg border border-white/10 bg-white/5 overflow-hidden">
          {([
            ["trending","Trending"],
            ["top","Top"],
            ["gainers","Gainers"],
            ["new","New Pairs"],
          ] as Array<[HomeTab,string]>).map(([k, label]) => (
            <button
              key={k}
              onClick={() => props.onTab(k)}
              className={clsx(
                "px-3 py-2 text-sm",
                props.tab === k ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-white/10 bg-white/5 overflow-hidden">
          {([
            ["5m","5M"],
            ["1h","1H"],
            ["6h","6H"],
            ["24h","24H"],
          ] as Array<[Timeframe,string]>).map(([k, label]) => (
            <button
              key={k}
              onClick={() => props.onTimeframe(k)}
              className={clsx(
                "px-3 py-2 text-sm",
                props.timeframe === k ? "bg-blue-500/15 text-blue-200" : "text-white/70 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs text-white/40">Updated {updated}</div>

          <select
            value={props.rankBy}
            onChange={(e) => props.onRankBy(e.target.value as RankBy)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 outline-none"
          >
            <option value="trending">Rank by: Trending</option>
            <option value="volume">Rank by: 24h Volume</option>
            <option value="liquidity">Rank by: Liquidity</option>
          </select>

          <button
            onClick={props.onOpenFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Filter size={16} /> Filters
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            title="Settings"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {([
          ["all","All"],
          ["pumpfun","Pump.fun"],
          ["bonkfun","Bonk.fun"],
          ["ai","AI"]
        ] as Array<[Category,string]>).map(([k, label]) => (
          <button
            key={k}
            onClick={() => props.onCategory(k)}
            className={clsx(
              "px-3 py-1.5 rounded-full text-xs border",
              props.category === k ? "border-blue-400/60 bg-blue-500/10 text-blue-200" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
