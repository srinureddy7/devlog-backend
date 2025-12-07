import { IUserDocument, IUserResponse } from "../interfaces/IUser";
import {
  IBlogDocument,
  IBlogResponse,
  ICategoryDocument,
  ICategoryResponse,
} from "../interfaces/IBlog";

// Convert user document to response object
export const userToResponse = (
  user: IUserDocument | null
): IUserResponse | null => {
  if (!user) {
    return null;
  }

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
      (user as any).fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      undefined,
  };
};

// Convert blog document to response object
export const blogToResponse = async (
  blog: IBlogDocument
): Promise<IBlogResponse> => {
  // Populate author and category if not already populated
  if (!blog.populated("author")) {
    await blog.populate("author", "username email avatar firstName lastName");
  }

  if (!blog.populated("category")) {
    await blog.populate("category", "name slug");
  }

  const author = blog.author as any;
  const category = blog.category as any;

  return {
    id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    featuredImage: blog.featuredImage,
    author: {
      id: author._id.toString(),
      username: author.username,
      email: author.email,
      avatar: author.avatar,
      fullName:
        `${author.firstName || ""} ${author.lastName || ""}`.trim() ||
        undefined,
    },
    category: {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    },
    tags: blog.tags,
    status: blog.status,
    isFeatured: blog.isFeatured,
    readTime: blog.readTime,
    views: blog.views,
    likes: blog.likes,
    publishedAt: blog.publishedAt,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    keywords: blog.keywords,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};

// Convert category document to response object
export const categoryToResponse = async (
  category: ICategoryDocument
): Promise<ICategoryResponse> => {
  // Populate createdBy if not already populated
  if (!category.populated("createdBy")) {
    await category.populate("createdBy", "username email");
  }

  const createdBy = category.createdBy as any;
  const blogCount = (category as any).blogCount || 0;

  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdBy: {
      id: createdBy._id.toString(),
      username: createdBy.username,
      email: createdBy.email,
    },
    blogCount,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

// Convert array of blogs to response objects
export const blogsToResponse = async (
  blogs: IBlogDocument[]
): Promise<IBlogResponse[]> => {
  return Promise.all(blogs.map(blogToResponse));
};

// Convert array of categories to response objects
export const categoriesToResponse = async (
  categories: ICategoryDocument[]
): Promise<ICategoryResponse[]> => {
  return Promise.all(categories.map(categoryToResponse));
};

// Pagination helper
export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
