/**
 * Failed-attempt limiter for access-key validation (sliding window, per client).
 * In-memory: correct for a single server process. A multi-instance deployment
 * must back this with a shared store (Redis/Upstash or a Postgres table) —
 * see ACCESS_KEYS.md.
 */
export class FailureLimiter {
  private hits = new Map<string, number[]>();
  constructor(private readonly max: number, private readonly windowMs: number, private readonly now = () => Date.now()) {}

  private recent(id: string): number[] {
    const t = this.now();
    const list = (this.hits.get(id) ?? []).filter((x) => t - x < this.windowMs);
    if (list.length) this.hits.set(id, list);
    else this.hits.delete(id);
    return list;
  }

  /** Seconds until the client may try again, or 0 if allowed. */
  retryAfter(id: string): number {
    const list = this.recent(id);
    if (list.length < this.max) return 0;
    return Math.ceil((list[0] + this.windowMs - this.now()) / 1000);
  }

  fail(id: string) {
    const list = this.recent(id);
    list.push(this.now());
    this.hits.set(id, list);
    if (this.hits.size > 50_000) this.hits.clear(); // memory guard
  }

  reset(id: string) {
    this.hits.delete(id);
  }
}
