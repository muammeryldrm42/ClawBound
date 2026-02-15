import { NextResponse } from "next/server";
import { dexGet } from "@/lib/dex";
import { cacheGet, cacheSet } from "@/lib/cache";
import lists from "@/config/tokenLists.json";
import { tagsHeuristic } from "@/lib/tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Profile = { chainId: string; tokenAddress: string; icon?: string; description?: string; links?: any[]; };
type Pair = any;

function chunk<T>(arr: T[], n: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function pickBestPair(pairs: Pair[]) {
  const sol = pairs.filter(p => p?.chainId === "solana");
  sol.sort((a, b) => (Number(b?.liquidity?.usd) || 0) - (Number(a?.liquidity?.usd) || 0));
  return sol[0] || null;
}

function mergeTags(name?: string, symbol?: string, address?: string) {
  const tags = new Set<string>(tagsHeuristic(name, symbol));
  const addr = (address || "").toLowerCase();

  for (const t of ["ai","pumpfun","bonkfun"] as const) {
    const list = (lists as any)[t] || [];
    if (list.some((x: any) => (x.address || "").toLowerCase() === addr)) tags.add(t);
  }
  return Array.from(tags);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tab = (url.searchParams.get("tab") || "trending").toLowerCase();
  const rankBy = (url.searchParams.get("rankBy") || "volume").toLowerCase();
  const limit = Math.min(120, Math.max(20, Number(url.searchParams.get("limit") || "80")));

  const key = `dex:home:${tab}:${rankBy}:${limit}`;
  const cached = cacheGet<any>(key);
  if (cached) return NextResponse.json(cached);

  // Candidate set:
  // 1) latest token profiles (new tokens)
  // 2) optional pinned tokens from config
  const profiles = await dexGet<Profile[]>("/token-profiles/latest/v1");
  const latest = (profiles || []).filter(p => p?.chainId === "solana" && !!p?.tokenAddress).slice(0, 120);

  const pinned = [
    ...((lists as any).ai || []),
    ...((lists as any).pumpfun || []),
    ...((lists as any).bonkfun || [])
  ].map((x: any) => ({ tokenAddress: x.address, icon: x.icon, chainId: "solana" }));

  const uniq = new Map<string, Profile>();
  for (const p of [...pinned, ...latest]) {
    const a = (p.tokenAddress || "").toLowerCase();
    if (!a) continue;
    if (!uniq.has(a)) uniq.set(a, p);
  }

  const addrs = Array.from(uniq.values()).map(p => p.tokenAddress).slice(0, limit);
  const batches = chunk(addrs, 30);

  const pairsByAddr = new Map<string, Pair[]>();
  for (const b of batches) {
    const resp = await dexGet<any[]>("/tokens/v1/solana/" + b.join(","));
    for (const p of (resp || [])) {
      const a = (p?.baseToken?.address || "").toLowerCase();
      if (!a) continue;
      const cur = pairsByAddr.get(a) || [];
      cur.push(p);
      pairsByAddr.set(a, cur);
    }
  }

  const rows = addrs.map((addr) => {
    const ps = pairsByAddr.get(addr.toLowerCase()) || [];
    const best = pickBestPair(ps);
    if (!best) return null;

    const name = best.baseToken?.name;
    const symbol = best.baseToken?.symbol;
    const logoURI = best.info?.imageUrl || (uniq.get(addr.toLowerCase()) as any)?.icon;

    const liq = Number(best.liquidity?.usd) || 0;
    const vol24 = Number(best.volume?.h24) || 0;

    return {
      address: best.baseToken?.address,
      symbol,
      name,
      logoURI,
      price: best.priceUsd ? Number(best.priceUsd) : undefined,
      liquidity: liq || undefined,
      volume24h: vol24 || undefined,
      mcap: best.marketCap ? Number(best.marketCap) : undefined,
      fdv: best.fdv ? Number(best.fdv) : undefined,
      change5m: best.priceChange?.m5 ? Number(best.priceChange.m5) : undefined,
      change1h: best.priceChange?.h1 ? Number(best.priceChange.h1) : undefined,
      change6h: best.priceChange?.h6 ? Number(best.priceChange.h6) : undefined,
      change24h: best.priceChange?.h24 ? Number(best.priceChange.h24) : undefined,
      txns24h: best.txns?.h24 ? Number(best.txns.h24) : undefined,
      makers24h: best.makers?.h24 ? Number(best.makers.h24) : undefined,
      tags: mergeTags(name, symbol, best.baseToken?.address)
    };
  }).filter(Boolean) as any[];

  // "new" = newest profiles -> keep order
  // other tabs = sorts
  const sorted = [...rows];
  if (tab === "top") {
    sorted.sort((a, b) => (Number(b.mcap || b.fdv) || 0) - (Number(a.mcap || a.fdv) || 0));
  } else if (tab === "gainers") {
    sorted.sort((a, b) => (Number(b.change24h) || 0) - (Number(a.change24h) || 0));
  } else if (tab === "trending") {
    if (rankBy === "liquidity") sorted.sort((a, b) => (Number(b.liquidity) || 0) - (Number(a.liquidity) || 0));
    else sorted.sort((a, b) => (Number(b.volume24h) || 0) - (Number(a.volume24h) || 0));
  } else if (tab === "new") {
    // keep order as-is (most recent first from token profiles)
  }

  const out = { data: { rows: sorted.slice(0, limit) } };
  cacheSet(key, out, 40_000);
  return NextResponse.json(out);
}
