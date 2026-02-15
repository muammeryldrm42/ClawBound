const BASE = "https://api.dexscreener.com";

export async function dexGet<T>(path: string, qs?: Record<string, string | number | boolean>) {
  const u = new URL(BASE + path);
  if (qs) Object.entries(qs).forEach(([k, v]) => u.searchParams.set(k, String(v)));

  const r = await fetch(u.toString(), { headers: { accept: "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`DexScreener ${r.status}: ${await r.text()}`);
  return (await r.json()) as T;
}
