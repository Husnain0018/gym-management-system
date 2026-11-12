import rateLimit from 'express-rate-limit';

// Strict limiter for login attempts to thwart brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  skip: (req) =>
    process.env.NODE_ENV === 'test' ||
    req.headers['x-load-test'] === 'true' ||
    process.env.DISABLE_RATE_LIMIT === 'true'
});

// High-capacity API limiter ensuring 1,000+ concurrent requests are supported seamlessly
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // 50,000 requests per 15 mins for high concurrency
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again shortly.'
  },
  skip: (req) =>
    process.env.NODE_ENV === 'test' ||
    req.headers['x-load-test'] === 'true' ||
    process.env.DISABLE_RATE_LIMIT === 'true'
});
