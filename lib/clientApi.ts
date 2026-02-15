import { tagsHeuristic, type Tag } from "@/lib/tags";
import type { TokenRow } from "@/components/TokenTable";

export async function fetchHomeList(args: { tab: string; tf: string; rankBy: string }): Promise<{ rows: TokenRow[] }> {
  const { tab, rankBy } = args;

  const j = await fetch(`/api/dex/home?tab=${encodeURIComponent(tab)}&rankBy=${encodeURIComponent(rankBy)}&limit=80`).then(r => r.json());
  if (j?.error) throw new Error(j.error);

  const rows: TokenRow[] = (j?.data?.rows || []).map((x: any) => {
    const tags = (x.tags || tagsHeuristic(x.name, x.symbol)) as Tag[];
    return {
      address: x.address,
      symbol: (x.symbol || "TOKEN").toString().toUpperCase(),
      name: x.name,
      logoURI: x.logoURI,
      price: x.price,
      liquidity: x.liquidity,
      volume24h: x.volume24h,
      mcap: x.mcap,
      fdv: x.fdv,
      change5m: x.change5m,
      change1h: x.change1h,
      change6h: x.change6h,
      change24h: x.change24h,
      txns24h: x.txns24h,
      makers24h: x.makers24h,
      tags
    } as TokenRow;
  });

  return { rows };
}
