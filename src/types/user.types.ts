import { Document, Types } from "mongoose";

// Simple type for user data (no Mongoose extensions)
export type UserData = {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

// Type for the Mongoose document (extends UserData and Document)
export type UserDocument = UserData &
  Document & {
    _id: Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    changedPasswordAfter(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
    fullName?: string;
  };

// For API responses
export type UserResponse = Omit<
  UserData,
  "password" | "refreshToken" | "passwordResetToken" | "passwordResetExpires"
> & {
  id: string;
  fullName?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
