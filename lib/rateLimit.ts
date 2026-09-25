const hits = new Map<string, number[]>();
/** 简单的内存限流：每小时最多 max 次 */
export function limited(id: string, max: number) {
  const now = Date.now();
  const arr = (hits.get(id) ?? []).filter((t) => now - t < 3600_000);
  if (arr.length >= max) { hits.set(id, arr); return true; }
  arr.push(now); hits.set(id, arr); return false;
}
