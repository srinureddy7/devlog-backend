import { Document, Types } from "mongoose";

// Base blog interface
export interface IBlogBase {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: Types.ObjectId | string; // Allow both ObjectId and string
  category: Types.ObjectId | string; // Allow both ObjectId and string
  tags: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  readTime: number;
  views: number;
  likes: number;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Blog document interface
export interface IBlogDocument extends IBlogBase, Document {
  _id: Types.ObjectId;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  incrementViews(): Promise<void>;
  incrementLikes(): Promise<void>;
  generateSlug(): Promise<string>;
}

// Category base interface
export interface ICategoryBase {
  name: string;
  slug: string;
  description?: string;
  createdBy: Types.ObjectId | string; // Allow both
  isActive: boolean;
}

// Category document interface
export interface ICategoryDocument extends ICategoryBase, Document {
  _id: Types.ObjectId;
  __v?: number;
  blogCount?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  updateBlogCount(): Promise<void>;
}

// Blog response for API
export interface IBlogResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    fullName?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  readTime: number;
  views: number;
  likes: number;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Category response for API
export interface ICategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  blogCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Blog creation data
export interface ICreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  status?: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Blog update data
export interface IUpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Category creation data
export interface ICreateCategoryData {
  name: string;
  description?: string;
}

// Category update data
export interface IUpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Query parameters for blogs
export interface IBlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: string;
  author?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  featured?: boolean | string; // Allow string for query params
}

// Query parameters for categories
export interface ICategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | string; // Allow string for query params
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Paginated response
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
