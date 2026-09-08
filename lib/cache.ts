interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private inFlightPromises: Map<string, Promise<T>> = new Map();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { data, expiresAt });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Fetch with stampede protection (Promise coalescing) and caching.
   * If a fetch for `key` is already in progress, other callers await the same promise.
   */
  async getOrFetch(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const inFlight = this.inFlightPromises.get(key);
    if (inFlight) {
      return inFlight;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, promise);
    return promise;
  }
}

export interface CachedAgent {
  opportunityId: string;
  contactId?: string;
  name: string;
  role: string;
  stage: string;
  loomUrl?: string;
  thumbnailUrl?: string;
  hrInfo?: string;
  clientRate?: string;
}

// Global cache instance for GHL agents listing (TTL: 60 seconds)
export const agentsCache = new MemoryCache<CachedAgent[]>(60 * 1000);
