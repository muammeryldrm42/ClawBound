"use client";

import { formatCompactUSD } from "@/lib/format";
import { useMemo } from "react";

export default function TopStats({ rows }: { rows: any[] }) {
  const agg = useMemo(() => {
    const vol = rows.reduce((a, b) => a + (b.volume24h || 0), 0);
    const tx = rows.reduce((a, b) => a + (b.txns24h || 0), 0);
    return { vol, tx };
  }, [rows]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/50">24H Volume</div>
        <div className="mt-1 text-2xl font-semibold">{formatCompactUSD(agg.vol)}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/50">24H Txns</div>
        <div className="mt-1 text-2xl font-semibold">{agg.tx.toLocaleString()}</div>
      </div>
    </div>
  );
}
