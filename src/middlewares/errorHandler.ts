import { Request, Response } from "express";
import logger from "../utils/logger";
import ApiResponse from "../utils/apiResponse";
import { AppError } from "../utils/appError";
import { MongoError } from "mongodb";

const errorHandler = (
  err: Error | AppError | MongoError,
  req: Request,
  res: Response
  // next: NextFunction
) => {
  // let error = err;
  let statusCode = 500;
  let message = "Internal server error";

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle specific error types
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    message = "Duplicate field value entered";
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const validationError = err as any;
    message = Object.values(validationError.errors)
      .map((val: any) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  // If it's an AppError (our custom error)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Development vs production error response
  if (process.env.NODE_ENV === "development") {
    return ApiResponse.error(res, message, statusCode, err.stack);
  }

  // Production error response
  return ApiResponse.error(res, message, statusCode);
};

export default errorHandler;
