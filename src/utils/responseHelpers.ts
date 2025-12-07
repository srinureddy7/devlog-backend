import { IUserDocument, IUserResponse } from "../interfaces/IUser";

export const userToResponse = (user: IUserDocument): IUserResponse => {
  return {
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
};
