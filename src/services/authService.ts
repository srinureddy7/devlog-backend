import jwt from "jsonwebtoken";
import User from "../models/User";
import {
  IUserDocument,
  IUserResponse,
  ILoginCredentials,
  IRegisterData,
  ITokens,
} from "../interfaces/IUser";
import { BadRequestError, UnauthorizedError } from "../utils/appError";
import logger from "../utils/logger";
import CacheManager from "../config/cache";
import { userToResponse } from "../utils/responseHelpers";

class AuthService {
  private cache = CacheManager;

  async register(userData: IRegisterData): Promise<IUserDocument> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (existingUser) {
        throw new BadRequestError(
          "User with this email or username already exists"
        );
      }

      // Create new user
      const user = await User.create(userData);

      // Invalidate cache for users list
      this.cache.delPattern("users:");

      logger.info(`New user registered: ${user.email}`);
      return user;
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }

  async login(
    credentials: ILoginCredentials
  ): Promise<{ user: IUserResponse; tokens: ITokens }> {
    try {
      // Find user by email
      const user = await User.findOne({ email: credentials.email }).select(
        "+password +refreshToken"
      );

      if (!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Check password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Update user with refresh token
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Convert to response object (toJSON() will apply the transform)
      // const userObj = user.toJSON();

      // Create response object - using proper IUserResponse structure
      // const userResponse: IUserResponse = {
      //   id: user._id.toString(), // userObj.id should be transformed by toJSON()
      //   email: user.email,
      //   username: user.username,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   avatar: user.avatar,
      //   bio: user.bio,
      //   role: user.role,
      //   isVerified: user.isVerified,
      //   lastLogin: user.lastLogin,
      //   createdAt: user.createdAt,
      //   updatedAt: user.updatedAt,
      //   fullName:
      //     `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
      // };
      const userResponse = userToResponse(user);

      // Cache user data
      const cacheKey = `user:${user._id}`;
      this.cache.set(cacheKey, userResponse);

      logger.info(`User logged in: ${user.email}`);
      return { user: userResponse, tokens: { accessToken, refreshToken } };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<ITokens> {
    try {
      // Find user by refresh token
      const user = await User.findOne({ refreshToken }).select("+refreshToken");
      if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      // Verify refresh token
      const decoded = (await this.verifyToken(refreshToken, "refresh")) as any;

      // Check if token belongs to user
      if (decoded.userId !== user._id.toString()) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      // Generate new tokens
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save({ validateBeforeSave: false });

      logger.info(`Token refreshed for user: ${user.email}`);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error("Refresh token error:", error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { refreshToken: null });

      // Clear user cache
      this.cache.del(`user:${userId}`);

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error("Logout error:", error);
      throw error;
    }
  }

  async verifyToken(token: string, type: "access" | "refresh"): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!, {
        audience: "devlog-users",
        issuer: "devlog-api",
      });
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(`${type} token expired`);
      }
      throw new UnauthorizedError(`Invalid ${type} token`);
    }
  }

  async getCurrentUser(userId: string): Promise<IUserResponse | null> {
    try {
      // Try cache first
      const cacheKey = `user:${userId}`;
      const cachedUser = this.cache.get<IUserResponse>(cacheKey);

      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      // Create response object
      // const userResponse: IUserResponse = {
      //   id: user._id.toString(),
      //   email: user.email,
      //   username: user.username,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   avatar: user.avatar,
      //   bio: user.bio,
      //   role: user.role,
      //   isVerified: user.isVerified,
      //   lastLogin: user.lastLogin,
      //   createdAt: user.createdAt,
      //   updatedAt: user.updatedAt,
      //   fullName:
      //     `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
      // };

      const userResponse = userToResponse(user);

      // Cache the response
      this.cache.set(cacheKey, userResponse);
      return userResponse;
    } catch (error) {
      logger.error("Get current user error:", error);
      throw error;
    }
  }
}

export default new AuthService();
