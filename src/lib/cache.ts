type CacheEntry<T> = { data: T; expiresAt: number };

class CacheStore {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys())
      if (key.startsWith(prefix)) this.store.delete(key);
  }
}

export const cache = new CacheStore();

export const TTL = {
  PROJECTS: 2 * 60_000,
  TASKS: 60_000,
  MEMBERS: 5 * 60_000,
  ASSIGNMENTS: 60_000,
  SPRINTS: 5 * 60_000,
  DASHBOARD: 5 * 60_000,
} as const;
