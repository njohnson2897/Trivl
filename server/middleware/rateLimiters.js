import { rateLimit } from "express-rate-limit";

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: { message: "Too many messages sent. Please try again later." },
});

// Only failed attempts count, so normal logins never hit the limit.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: "Too many failed login attempts. Please try again later." },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  message: { error: "Too many sign-up attempts. Please try again later." },
});