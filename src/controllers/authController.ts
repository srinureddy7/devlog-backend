import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import AuthService from "../services/authService";
import ApiResponse from "../utils/apiResponse";
import {
  IRegisterData,
  ILoginCredentials,
  IUserResponse,
} from "../interfaces/IUser";
import { BadRequestError } from "../utils/appError";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const userData: IRegisterData = req.body;
      const user = await AuthService.register(userData);

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Set refresh token in cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Create response object
      const userResponse: IUserResponse = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
      };

      return ApiResponse.success(
        res,
        {
          user: userResponse,
          accessToken,
        },
        "User registered successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const credentials: ILoginCredentials = req.body;
      const { user, tokens } = await AuthService.login(credentials);

      // Set refresh token in cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(
        res,
        {
          user,
          accessToken: tokens.accessToken,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new BadRequestError("Refresh token is required");
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(
        res,
        { accessToken: tokens.accessToken },
        "Token refreshed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (userId) {
        await AuthService.logout(userId);
      }

      // Clear cookie
      res.clearCookie("refreshToken");

      return ApiResponse.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new BadRequestError("User ID not found");
      }

      const user = await AuthService.getCurrentUser(userId);

      if (!user) {
        throw new BadRequestError("User not found");
      }

      return ApiResponse.success(res, user, "User fetched successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
