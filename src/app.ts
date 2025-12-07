import express from "express";
import "dotenv/config";
import compression from "compression";
import cookieParser from "cookie-parser";
import Database from "./config/database";
import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import { securityMiddleware, xssClean } from "./middlewares/security";
import { apiLimiter } from "./middlewares/rateLimiter";
import blogRoutes from "./routes/blogRoutes";

// Routes
import authRoutes from "./routes/authRoutes";

class Application {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "5000");

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await Database.connect();
      logger.info("Database initialization complete");
    } catch (error) {
      logger.error("Database initialization failed:", error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(securityMiddleware);

    // Body parsing
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    this.app.use(cookieParser());

    // Compression
    this.app.use(compression());

    // XSS protection
    this.app.use(xssClean);

    // Rate limiting for API routes
    this.app.use("/api", apiLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "success",
        message: "DevLog API is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: Database.getConnectionStatus() ? "connected" : "disconnected",
      });
    });

    // API routes
    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1", blogRoutes);

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        status: "error",
        message: `Can't find ${req.originalUrl} on this server`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      await Database.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      await Database.disconnect();
      process.exit(0);
    });

    // Unhandled rejection
    process.on("unhandledRejection", (reason: Error) => {
      logger.error("Unhandled Rejection:", reason);
      // Don't exit in development
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    });

    // Uncaught exception
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  }
}

// Create and start application
const app = new Application();
app.start();

export default app;
