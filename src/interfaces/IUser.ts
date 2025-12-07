import { Document, Types } from "mongoose";

// Base interface without Mongoose document properties
export interface IUserBase {
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
}

// Interface for User document (extends Mongoose Document)
export interface IUserDocument extends IUserBase, Document {
  // Mongoose adds _id and __v automatically
  _id: Types.ObjectId;
  __v?: number;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;

  // Virtuals
  fullName?: string;
}

// For responses (without sensitive data and Mongoose methods)
export interface IUserResponse {
  id: string; // Use id for REST API
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  fullName?: string;
}

// For registration
export interface IRegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// For login
export interface ILoginCredentials {
  email: string;
  password: string;
}

// For tokens
export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

// For JWT payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Type for User model
export type UserModel = Document<unknown, any, IUserDocument> &
  IUserDocument & {
    _id: Types.ObjectId;
  };
