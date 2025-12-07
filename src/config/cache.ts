import NodeCache from 'node-cache';

class CacheManager {
  private static instance: CacheManager;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL || '600'), // 10 minutes default
      checkperiod: 120,
      useClones: false,
    });

    // Cache statistics logging
    setInterval(() => {
      const stats = this.cache.getStats();
      console.log(`Cache Stats - Hits: ${stats.hits}, Misses: ${stats.misses}, Keys: ${stats.keys}`);
    }, 300000); // Log every 5 minutes
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.cache.options.stdTTL);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Pattern-based key operations
  getKeys(pattern: string): string[] {
    return this.cache.keys().filter(key => key.includes(pattern));
  }

  delPattern(pattern: string): void {
    const keys = this.getKeys(pattern);
    keys.forEach(key => this.del(key));
  }
}

export default CacheManager.getInstance();