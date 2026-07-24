import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

const redis = redisUrl.startsWith('https://') && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : new Redis({ url: 'https://placeholder.upstash.io', token: 'placeholder' }); // Dummy fallback for typecheck if env vars are missing at build

export const inquiryRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:inquiry',
});

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'rl:upload',
});

export const trackRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute to prevent brute-forcing IDs
  prefix: 'rl:track',
});

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 searches per minute
  prefix: 'rl:search',
});

export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 requests per minute
  prefix: 'rl:admin',
});
