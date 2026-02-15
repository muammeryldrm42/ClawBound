import { NextResponse } from "next/server";
import { dexGet } from "@/lib/dex";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Resp = any;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ data: { items: [] } });

  const key = `dex:search:${q.toLowerCase()}`;
  const cached = cacheGet<Resp>(key);
  if (cached) return NextResponse.json(cached);

  const data = await dexGet<Resp>("/latest/dex/search", { q });
  const pairs = (data?.pairs || []).filter((p: any) => p?.chainId === "solana");

  const out = {
    data: {
      items: pairs.slice(0, 12).map((p: any) => ({
        address: p.baseToken?.address,
        symbol: p.baseToken?.symbol,
        name: p.baseToken?.name
      })).filter((x: any) => !!x.address)
    }
  };

  cacheSet(key, out, 5_000);
  return NextResponse.json(out);
}
