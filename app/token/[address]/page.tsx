"use client";

import Sidebar from "@/components/Sidebar";
import TokenChart from "@/components/TokenChart";
import CopyButton from "@/components/CopyButton";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatCompactUSD, formatPct, formatPrice } from "@/lib/format";

type TF = "5m" | "15m" | "1h" | "4h" | "1d";

export default function TokenDetail() {
  const params = useParams<{ address: string }>();
  const address = useMemo(() => String(params.address || ""), [params.address]);

  const [tf, setTf] = useState<TF>("15m");
  const [market, setMarket] = useState<any>(null);
  const [ohlcv, setOhlcv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    Promise.all([
      fetch(`/api/dex/token?address=${encodeURIComponent(address)}`).then(r => r.json()),
    ])
      .then(([m]) => {
        if (!alive) return;
        if (m?.error) throw new Error(m.error);
        setMarket(m);
        const pool = m?.data?.bestPair?.pairAddress;
        if (!pool) throw new Error("No pool/pair found for this token.");
        return fetch(`/api/gecko/ohlcv?network=solana&pool=${encodeURIComponent(pool)}&tf=${tf}`).then(r => r.json());
      })
      .then((o) => {
        if (!alive) return;
        if (o?.error) throw new Error(o.error);
        setOhlcv(o);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load");
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [address, tf]);

  const md = market?.data?.bestPair;
  const name = md?.baseToken?.name || "Token";
  const symbol = md?.baseToken?.symbol ? String(md.baseToken.symbol).toUpperCase() : "";

  const price = md?.priceUsd ? Number(md.priceUsd) : undefined;
  const liq = md?.liquidity?.usd ? Number(md.liquidity.usd) : undefined;
  const vol24 = md?.volume?.h24 ? Number(md.volume.h24) : undefined;
  const mcap = md?.marketCap ? Number(md.marketCap) : undefined;
  const fdv = md?.fdv ? Number(md.fdv) : undefined;
  const ch24 = md?.priceChange?.h24 ? Number(md.priceChange.h24) : undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{name} <span className="text-white/50">{symbol}</span></div>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              <span className="font-mono">{address}</span>
              <CopyButton value={address} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-w-[260px]">
            <div className="text-xs text-white/50">Market Cap</div>
            <div className="mt-1 text-2xl font-semibold">{formatCompactUSD(mcap)}</div>
            <div className="mt-2 text-xs text-white/50">FDV</div>
            <div className="mt-1 text-lg">{formatCompactUSD(fdv)}</div>
            <div className="mt-2 text-xs text-white/50">Price</div>
            <div className="mt-1 text-lg">{formatPrice(price)}</div>
            <div className="mt-2 text-xs text-white/50">24h</div>
            <div className="mt-1 text-sm">{formatPct(ch24)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9 rounded-xl border border-white/10 bg-[#0a0e13]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-medium">Chart</div>
              <div className="flex gap-2">
                {(["5m","15m","1h","4h","1d"] as TF[]).map(x => (
                  <button
                    key={x}
                    onClick={() => setTf(x)}
                    className={"px-2.5 py-1 rounded-md text-xs border " + (tf===x ? "border-blue-400/60 bg-blue-500/10 text-blue-200" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10")}
                  >
                    {x.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3">
              <TokenChart ohlcv={ohlcv} loading={loading} error={err} />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Liquidity</div>
              <div className="mt-1 text-lg">{formatCompactUSD(liq)}</div>
              <div className="mt-3 text-xs text-white/50">24h Volume</div>
              <div className="mt-1 text-lg">{formatCompactUSD(vol24)}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <div className="text-xs text-white/50 mb-2">Quick actions</div>
              {md?.url ? (
                <a className="block hover:text-white" target="_blank" rel="noreferrer" href={md.url}>Open on DexScreener</a>
              ) : null}
              <a className="block hover:text-white" target="_blank" rel="noreferrer"
                 href={"https://solscan.io/token/" + encodeURIComponent(address)} >Open on Solscan</a>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-xs text-white/40">
          Data powered by DexScreener • OHLCV by GeckoTerminal • Powered by OpenClaw
        </footer>
      </main>
    </div>
  );
}
