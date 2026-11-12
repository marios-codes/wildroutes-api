import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/app-error';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILED_ATTEMPTS = 10;

// Counts failed logins per client IP in process memory (single instance only).
export const loginRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: LOGIN_MAX_FAILED_ATTEMPTS,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('Too many login attempts, please try again later', 429));
  },
});
