import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/appError';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Get token from header or cookie
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw new UnauthorizedError('User no longer exists');
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError('Password recently changed. Please log in again.');
    }

    // Grant access
    req.user = {
      userId: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('You are not logged in');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const currentUser = await User.findById(decoded.userId);
      
      if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = {
          userId: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without auth
    next();
  }
};