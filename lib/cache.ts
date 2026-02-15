type CacheEntry<T> = { exp: number; v: T };
const store = new Map<string, CacheEntry<any>>();

export function cacheGet<T>(k: string): T | null {
  const e = store.get(k);
  if (!e) return null;
  if (Date.now() > e.exp) { store.delete(k); return null; }
  return e.v as T;
}

export function cacheSet<T>(k: string, v: T, ttlMs: number) {
  store.set(k, { v, exp: Date.now() + ttlMs });
}
