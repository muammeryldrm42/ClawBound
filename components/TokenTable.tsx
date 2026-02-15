"use client";

import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { formatCompactUSD, formatPct, formatPrice } from "@/lib/format";
import CopyButton from "@/components/CopyButton";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export type ColumnKey =
  | "token"
  | "price"
  | "age"
  | "txns"
  | "volume24h"
  | "makers"
  | "change5m"
  | "change1h"
  | "change6h"
  | "change24h"
  | "liquidity"
  | "mcap"
  | "fdv";

export type TokenRow = {
  address: string;
  symbol: string;
  name?: string;
  logoURI?: string;
  price?: number;
  ageSeconds?: number;
  txns24h?: number;
  volume24h?: number;
  makers24h?: number;
  change5m?: number;
  change1h?: number;
  change6h?: number;
  change24h?: number;
  liquidity?: number;
  mcap?: number;
  fdv?: number;
  tags: Array<"ai" | "pumpfun" | "bonkfun">;
};

const ALL_COLUMNS: { key: ColumnKey; label: string; minW: number }[] = [
  { key: "token", label: "TOKEN", minW: 320 },
  { key: "price", label: "PRICE", minW: 120 },
  { key: "age", label: "AGE", minW: 90 },
  { key: "txns", label: "TXNS", minW: 110 },
  { key: "volume24h", label: "VOLUME", minW: 140 },
  { key: "makers", label: "MAKERS", minW: 110 },
  { key: "change5m", label: "5M", minW: 90 },
  { key: "change1h", label: "1H", minW: 90 },
  { key: "change6h", label: "6H", minW: 90 },
  { key: "change24h", label: "24H", minW: 90 },
  { key: "liquidity", label: "LIQUIDITY", minW: 140 },
  { key: "mcap", label: "MCAP", minW: 140 },
  { key: "fdv", label: "FDV", minW: 140 }
];

function ageFmt(s?: number) {
  if (!s || s < 0) return "—";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function pctCell(v?: number) {
  const num = typeof v === "number" ? v : Number(v);
  const txt = formatPct(num);
  const cls = (num || 0) >= 0 ? "text-emerald-300" : "text-rose-300";
  return <span className={cls}>{txt}</span>;
}

export default function TokenTable(props: {
  rows: TokenRow[];
  loading: boolean;
  error: string | null;
  columns: ColumnKey[];
  onColumns: (v: ColumnKey[]) => void;
  filtersOpen: boolean;
  onCloseFilters: () => void;
}) {
  const r = useRouter();
  const cols = useMemo(() => ALL_COLUMNS.filter(c => props.columns.includes(c.key)), [props.columns]);

  const [sortKey, setSortKey] = useState<ColumnKey>("volume24h");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...props.rows];
    const mult = sortDir === "desc" ? -1 : 1;
    arr.sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      const na = typeof av === "number" ? av : Number(av);
      const nb = typeof bv === "number" ? bv : Number(bv);
      return ((na || 0) - (nb || 0)) * mult;
    });
    return arr;
  }, [props.rows, sortKey, sortDir]);

  function toggleSort(k: ColumnKey) {
    if (sortKey === k) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(k); setSortDir("desc"); }
  }

  const Header = () => (
    <div className="sticky top-0 z-10 flex border-b border-white/10 bg-[#0a0e13]">
      {cols.map((c) => (
        <button
          key={c.key}
          onClick={() => toggleSort(c.key)}
          className={clsx("px-3 py-2 text-xs text-white/50 hover:text-white/80 flex items-center gap-1")}
          style={{ minWidth: c.minW }}
        >
          {c.label}
          {sortKey === c.key ? <span className="text-white/30">{sortDir === "desc" ? "▾" : "▴"}</span> : null}
        </button>
      ))}
      <div className="ml-auto w-[140px] shrink-0 px-3 py-2 text-xs text-white/50 text-right">ACTIONS</div>
    </div>
  );

  const Row = (index: number) => {
    const x = sorted[index];
    return (
      <div
        className="flex items-center border-b border-white/5 hover:bg-white/5 cursor-pointer"
        onClick={() => r.push(`/token/${x.address}`)}
      >
        {cols.map((c) => {
          if (c.key === "token") {
            return (
              <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 overflow-hidden shrink-0">
                  {x.logoURI ? <img src={x.logoURI} alt="" className="h-8 w-8 object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{x.symbol}</div>
                    <div className="flex gap-1">
                      {(x.tags || []).map(t => (
                        <span key={t} className="rounded px-1.5 py-0.5 text-[10px] border border-white/10 bg-white/5 text-white/60">
                          {t === "pumpfun" ? "PUMP" : t === "bonkfun" ? "BONK" : "AI"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-white/40 truncate">{x.name || x.address}</div>
                </div>
              </div>
            );
          }
          if (c.key === "price") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/80">{formatPrice(x.price)}</div>;
          if (c.key === "age") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{ageFmt(x.ageSeconds)}</div>;
          if (c.key === "txns") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{(x.txns24h ?? 0).toLocaleString()}</div>;
          if (c.key === "volume24h") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{formatCompactUSD(x.volume24h)}</div>;
          if (c.key === "makers") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{(x.makers24h ?? 0).toLocaleString()}</div>;
          if (c.key === "change5m") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm">{pctCell(x.change5m)}</div>;
          if (c.key === "change1h") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm">{pctCell(x.change1h)}</div>;
          if (c.key === "change6h") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm">{pctCell(x.change6h)}</div>;
          if (c.key === "change24h") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm">{pctCell(x.change24h)}</div>;
          if (c.key === "liquidity") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{formatCompactUSD(x.liquidity)}</div>;
          if (c.key === "mcap") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{formatCompactUSD(x.mcap)}</div>;
          if (c.key === "fdv") return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/70">{formatCompactUSD(x.fdv)}</div>;
          return <div key={c.key} style={{ minWidth: c.minW }} className="px-3 py-2 text-sm text-white/60">—</div>;
        })}
        <div className="ml-auto w-[140px] shrink-0 px-3 py-2 flex justify-end gap-2">
          <CopyButton value={x.address} />
          <a
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
            href={`https://dexscreener.com/solana/${encodeURIComponent(x.address)}`}
            target="_blank"
            rel="noreferrer"
            title="Open external"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  };

  const Empty = () => (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-sm text-white/70">
      <div className="text-white/90 font-medium">No data</div>
      <div className="mt-2 text-white/50">Try switching tab/timeframe or refresh.</div>
    </div>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0e13] overflow-hidden">
      <div className="h-[70vh]">
        {props.error ? <div className="p-6 text-sm text-rose-300">Error: {props.error}</div> : null}
        {props.loading && sorted.length === 0 ? <div className="p-6 text-sm text-white/60">Loading…</div> : null}
        {!props.loading && sorted.length === 0 ? <div className="p-6"><Empty /></div> : null}

        {sorted.length > 0 ? (
          <>
            <Header />
            <Virtuoso
              data={sorted}
              itemContent={(i) => Row(i)}
              style={{ height: "calc(100% - 41px)" }}
            />
          </>
        ) : null}
      </div>

      {props.filtersOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-start justify-end" onClick={props.onCloseFilters}>
          <div className="w-[380px] h-full bg-[#0a0e13] border-l border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-medium">Columns</div>
              <button className="text-sm text-white/60 hover:text-white" onClick={props.onCloseFilters}>Close</button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {ALL_COLUMNS.map((c) => {
                const on = props.columns.includes(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      if (c.key === "token") return;
                      if (on) props.onColumns(props.columns.filter(x => x !== c.key));
                      else props.onColumns([...props.columns, c.key]);
                    }}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-xs text-left",
                      on ? "border-blue-400/60 bg-blue-500/10 text-blue-200" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                      c.key === "token" && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 text-xs text-white/40">
              Tip: TOKEN column is pinned by design. Sorting works by clicking headers.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
