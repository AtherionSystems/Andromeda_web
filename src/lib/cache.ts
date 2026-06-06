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
  PROJECTS: 2 * 60_000, // 2 min — cambian poco
  TASKS: 60_000, // 1 min — más volátiles
  MEMBERS: 5 * 60_000, // 5 min — casi estáticos
  ASSIGNMENTS: 60_000, // 1 min
  SPRINTS: 5 * 60_000, // 5 min
  DASHBOARD: 5 * 60_000, // 5 min
} as const;
