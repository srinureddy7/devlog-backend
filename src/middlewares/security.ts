import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];

// XSS Protection
const xssClean = (req: Request, res: Response, next: NextFunction) => {
  // Clean user input
  const cleanInput = (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/[<>]/g, '');
    }
    if (Array.isArray(input)) {
      return input.map(cleanInput);
    }
    if (typeof input === 'object' && input !== null) {
      const cleaned: any = {};
      for (const key in input) {
        cleaned[key] = cleanInput(input[key]);
      }
      return cleaned;
    }
    return input;
  };

  req.body = cleanInput(req.body);
  req.query = cleanInput(req.query);
  req.params = cleanInput(req.params);
  next();
};

export { securityMiddleware, xssClean };