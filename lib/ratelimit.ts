import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch { /* no-op */ }

function makeLimiter(prefix: string, requests: number): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, "1 h"),
    analytics: true,
    prefix,
  });
}

export const generateLimiter     = makeLimiter("resumika:generate", 5);
export const coverLetterLimiter  = makeLimiter("resumika:cover-letter", 5);
export const checkoutLimiter     = makeLimiter("resumika:checkout", 10);

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "anonymous";
}

export async function isRateLimited(
  limiter: Ratelimit | null,
  ip: string,
): Promise<{ blocked: boolean; limit: number; remaining: number }> {
  if (!limiter) return { blocked: false, limit: 0, remaining: 0 };
  try {
    const { success, limit, remaining } = await limiter.limit(ip);
    return { blocked: !success, limit, remaining };
  } catch {
    return { blocked: false, limit: 0, remaining: 0 };
  }
}
