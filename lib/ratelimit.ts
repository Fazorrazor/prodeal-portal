import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create ratelimiter if we have the Redis env vars
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : new Redis({ url: 'https://placeholder.upstash.io', token: 'placeholder' }); // Dummy fallback for typecheck if env vars are missing at build

export const inquiryRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'rl:inquiry',
});

export const whatsappRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 h'),
  prefix: 'rl:whatsapp',
});

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'rl:upload',
});
