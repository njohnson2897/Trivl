import { rateLimit } from "express-rate-limit";

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: { message: "Too many messages sent. Please try again later." },
});