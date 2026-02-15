import { NextResponse } from "next/server";
import { geckoGet } from "@/lib/gecko";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Resp = any;

type TF = "5m" | "15m" | "1h" | "4h" | "1d";

function mapTf(tf: TF) {
  // GeckoTerminal: timeframe {minute|hour|day} + aggregate
  if (tf === "5m")  return { timeframe: "minute", aggregate: 5 };
  if (tf === "15m") return { timeframe: "minute", aggregate: 15 };
  if (tf === "1h")  return { timeframe: "hour", aggregate: 1 };
  if (tf === "4h")  return { timeframe: "hour", aggregate: 4 };
  return { timeframe: "day", aggregate: 1 };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const network = url.searchParams.get("network") || "solana";
  const pool = url.searchParams.get("pool");
  const tf = (url.searchParams.get("tf") || "15m") as TF;

  if (!pool) return NextResponse.json({ error: "missing pool" }, { status: 400 });

  const { timeframe, aggregate } = mapTf(tf);

  const key = `gecko:ohlcv:${network}:${pool}:${tf}`;
  const cached = cacheGet<Resp>(key);
  if (cached) return NextResponse.json(cached);

  const data = await geckoGet<Resp>(`/networks/${encodeURIComponent(network)}/pools/${encodeURIComponent(pool)}/ohlcv/${timeframe}`, {
    aggregate,
    limit: 200,
    currency: "usd"
  });

  // unify to a simple shape for the chart component
  const ohlcv_list = data?.data?.attributes?.ohlcv_list || data?.data?.ohlcv_list || [];
  const out = { data: { ohlcv_list } };

  cacheSet(key, out, 45_000);
  return NextResponse.json(out);
}
