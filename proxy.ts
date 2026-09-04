import { NextResponse, type NextRequest } from 'next/server';
import { globalRateLimiter, getClientIp } from './lib/rate-limit';

// Suspicious bot signatures commonly associated with scrapers and aggressive scripts
const BLOCKED_USER_AGENTS = [
  /scrapy/i,
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /zgrab/i,
  /dirbuster/i,
];

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block known malicious scrapers / automated attack tools
  if (BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent))) {
    return new NextResponse(
      JSON.stringify({ error: 'Access forbidden: Automated scraping detected.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. Global IP Rate Limiter on all /api endpoints
  const clientIp = getClientIp(request);
  const rateLimitResult = globalRateLimiter.check(`global:${clientIp}`);

  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please slow down.',
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitResult.headers,
        },
      }
    );
  }

  const response = NextResponse.next();

  // Attach rate limit headers for client transparency
  for (const [key, value] of Object.entries(rateLimitResult.headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
