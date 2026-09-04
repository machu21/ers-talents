import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitConfig {
  intervalMs: number; // Duration of window in ms
  maxRequests: number; // Max requests allowed within window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // seconds until window resets
  retryAfter?: number; // seconds to wait if rate limited
  headers: Record<string, string>;
}

export class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private intervalMs: number;
  private maxRequests: number;
  private lastCleanup: number = Date.now();

  constructor(config: RateLimitConfig) {
    this.intervalMs = config.intervalMs;
    this.maxRequests = config.maxRequests;
  }

  /**
   * Periodically purges entries that are older than the interval window to avoid memory leaks.
   */
  private cleanup(now: number): void {
    if (now - this.lastCleanup < Math.max(30000, this.intervalMs)) {
      return;
    }
    this.lastCleanup = now;
    const threshold = now - this.intervalMs;

    for (const [key, record] of this.store.entries()) {
      const validTimestamps = record.timestamps.filter((ts) => ts > threshold);
      if (validTimestamps.length === 0) {
        this.store.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }

  /**
   * Check and record a request for a given key (typically IP address or IP+action).
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    this.cleanup(now);

    const windowStart = now - this.intervalMs;
    const record = this.store.get(key) || { timestamps: [] };

    // Keep only timestamps within current window
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);
    const count = validTimestamps.length;

    const oldest = validTimestamps[0] || now;
    const resetTimeSeconds = Math.max(1, Math.ceil((oldest + this.intervalMs - now) / 1000));

    if (count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: resetTimeSeconds,
        retryAfter: resetTimeSeconds,
        headers: {
          'X-RateLimit-Limit': this.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTimeSeconds.toString(),
          'Retry-After': resetTimeSeconds.toString(),
        },
      };
    }

    // Allow request and record timestamp
    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });

    const remaining = Math.max(0, this.maxRequests - validTimestamps.length);

    return {
      success: true,
      limit: this.maxRequests,
      remaining,
      reset: resetTimeSeconds,
      headers: {
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTimeSeconds.toString(),
      },
    };
  }

  /**
   * Helper to inspect current remaining without incrementing
   */
  peek(key: string): { remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - this.intervalMs;
    const record = this.store.get(key);
    if (!record) {
      return { remaining: this.maxRequests, reset: Math.ceil(this.intervalMs / 1000) };
    }
    const valid = record.timestamps.filter((ts) => ts > windowStart);
    const oldest = valid[0] || now;
    return {
      remaining: Math.max(0, this.maxRequests - valid.length),
      reset: Math.max(1, Math.ceil((oldest + this.intervalMs - now) / 1000)),
    };
  }
}

/**
 * Robustly extracts the client IP address from request headers or socket info.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Return first IP if comma-separated list
    const ip = xForwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

// Pre-configured rate limiters for distinct application concerns
// 1. Global API gate (60 requests / minute)
export const globalRateLimiter = new RateLimiter({
  intervalMs: 60 * 1000,
  maxRequests: 60,
});

// 2. Agents listing route (30 requests / minute)
export const agentsRateLimiter = new RateLimiter({
  intervalMs: 60 * 1000,
  maxRequests: 30,
});

// 3. Hire submission route (5 requests / 15 minutes)
export const hireRateLimiter = new RateLimiter({
  intervalMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// 4. Per-opportunity cooldown tracker (prevents rapid double-booking attempts within 60 seconds)
export const opportunityCooldownLimiter = new RateLimiter({
  intervalMs: 60 * 1000,
  maxRequests: 1,
});
