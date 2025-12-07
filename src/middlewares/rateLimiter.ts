import rateLimit from 'express-rate-limit';
import ApiResponse from '../utils/apiResponse';

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'),
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (req, res) => {
    ApiResponse.error(res, 'Too many requests, please try again later', 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter, apiLimiter };