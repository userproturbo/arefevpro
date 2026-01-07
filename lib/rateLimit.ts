import "server-only";

type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

const rateLimitStore = new Map<string, number>();

export function checkRateLimit(
  key: string,
  cooldownMs: number,
  now: number = Date.now()
): RateLimitResult {
  const lastSeen = rateLimitStore.get(key);
  if (typeof lastSeen === "number") {
    const elapsed = now - lastSeen;
    if (elapsed < cooldownMs) {
      return { allowed: false, retryAfterMs: cooldownMs - elapsed };
    }
  }

  rateLimitStore.set(key, now);
  return { allowed: true, retryAfterMs: 0 };
}
