"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type SearchItem = { address: string; name?: string; symbol?: string };

export default function Sidebar() {
  const r = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    const close = () => setOpen(false);
    window.addEventListener("clawbound:focusSearch", focus as any);
    window.addEventListener("clawbound:closeSearch", close as any);
    return () => {
      window.removeEventListener("clawbound:focusSearch", focus as any);
      window.removeEventListener("clawbound:closeSearch", close as any);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (trimmed.length < 2) { setItems([]); return; }
    setLoading(true);
    fetch(`/api/dex/search?q=${encodeURIComponent(trimmed)}`)
      .then(r => r.json())
      .then((j) => {
        if (!alive) return;
        const mapped = (j?.data?.items || []).slice(0, 12).map((x: any) => ({
          address: x.address,
          name: x.name,
          symbol: x.symbol
        })).filter((x: any) => !!x.address);
        setItems(mapped);
        setOpen(mapped.length > 0);
        setIdx(0);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [trimmed]);

  function go(addr: string) {
    setOpen(false);
    r.push(`/token/${addr}`);
  }

  return (
    <aside className="w-[270px] shrink-0 border-r border-white/10 bg-[#0a0e13] p-4 relative">
      <div className="text-xl font-semibold tracking-tight">Clawbound</div>
      <div className="mt-3 text-xs text-white/40">Solana Screener (keyless)</div>

      <div className="mt-4 relative">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <Search size={16} className="opacity-70" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => items.length > 0 && setOpen(true)}
            onKeyDown={(e) => {
              if (!open && e.key === "Enter" && trimmed) return go(trimmed);
              if (!open) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((p) => Math.min(p + 1, items.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((p) => Math.max(p - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); const it = items[idx]; if (it) go(it.address); }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search CA / ticker  (press /)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          {loading ? <div className="h-4 w-4 animate-pulse rounded bg-white/10" /> : null}
        </div>

        {open ? (
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-white/10 bg-[#0b0f14] shadow-xl overflow-hidden">
            {items.map((it, i) => (
              <button
                key={it.address + i}
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(it.address)}
                className={clsx(
                  "w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-white/5",
                  i === idx && "bg-white/5"
                )}
              >
                <span className="truncate">
                  <span className="text-white/90">{it.symbol || "TOKEN"}</span>
                  <span className="text-white/40"> • {it.name || it.address.slice(0, 8) + "…"}</span>
                </span>
                <ArrowRight size={14} className="opacity-60" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1 text-sm">
        <button onClick={() => r.push("/")} className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/5">Home</button>
        <button onClick={() => r.push("/?tab=new")} className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/5">New Pairs</button>
        <button onClick={() => r.push("/?tab=gainers")} className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/5">Gainers</button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-white/40">
        Data: DexScreener • OHLCV: GeckoTerminal
      </div>
    </aside>
  );
}
