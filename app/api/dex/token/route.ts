import { NextResponse } from "next/server";
import { dexGet } from "@/lib/dex";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Resp = any;

function pickBestPair(pairs: any[]) {
  const sol = pairs.filter(p => p?.chainId === "solana");
  sol.sort((a, b) => (Number(b?.liquidity?.usd) || 0) - (Number(a?.liquidity?.usd) || 0));
  return sol[0] || null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "missing address" }, { status: 400 });

  const key = `dex:token:${address}`;
  const cached = cacheGet<Resp>(key);
  if (cached) return NextResponse.json(cached);

  const pairs = await dexGet<any[]>("/token-pairs/v1/solana/" + address);
  const bestPair = pickBestPair(pairs || []);

  const out = { data: { bestPair, pairsCount: (pairs || []).length } };
  cacheSet(key, out, 20_000);
  return NextResponse.json(out);
}
