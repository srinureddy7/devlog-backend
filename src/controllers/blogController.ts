import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import BlogService from "../services/blogService";
import CategoryService from "../services/categoryService";
import ApiResponse from "../utils/apiResponse";
import {
  ICreateBlogData,
  IUpdateBlogData,
  IBlogQuery,
  ICategoryQuery,
  ICreateCategoryData,
  IUpdateCategoryData,
} from "../interfaces/IBlog";

class BlogController {
  // Blog Controllers
  async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;
      const blogData: ICreateBlogData = req.body;

      // Admin can publish directly, users create as draft by default
      if (userRole !== "admin" && !blogData.status) {
        blogData.status = "draft";
      }

      const blog = await BlogService.createBlog(userId, blogData);

      return ApiResponse.success(
        res,
        blog,
        userRole === "admin"
          ? "Blog created successfully"
          : "Blog created and saved as draft",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getBlogById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const incrementViews = req.query.incrementViews === "true";

      const blog = await BlogService.getBlogById(id, incrementViews);

      return ApiResponse.success(res, blog, "Blog fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  async getBlogBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const incrementViews = req.query.incrementViews === "true";

      const blog = await BlogService.getBlogBySlug(slug, incrementViews);

      return ApiResponse.success(res, blog, "Blog fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const query: IBlogQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string,
        category: req.query.category as string,
        tag: req.query.tag as string,
        status: req.query.status as string,
        author: req.query.author as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        featured: req.query.featured as string,
      };

      const result = await BlogService.getAllBlogs(query);

      return ApiResponse.success(res, result, "Blogs fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  async getUserBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const userId = (req as any).user.userId;
      const query: IBlogQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string,
        category: req.query.category as string,
        tag: req.query.tag as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        featured: req.query.featured as string,
      };

      const result = await BlogService.getUserBlogs(userId, query);

      return ApiResponse.success(
        res,
        result,
        "User blogs fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { id } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;
      const updateData: IUpdateBlogData = req.body;

      const blog = await BlogService.updateBlog(
        id,
        userId,
        userRole,
        updateData
      );

      return ApiResponse.success(res, blog, "Blog updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      await BlogService.deleteBlog(id, userId, userRole);

      return ApiResponse.success(res, null, "Blog deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async likeBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const blog = await BlogService.likeBlog(id);

      return ApiResponse.success(res, blog, "Blog liked successfully");
    } catch (error) {
      next(error);
    }
  }

  async getRelatedBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const blogs = await BlogService.getRelatedBlogs(id, limit);

      return ApiResponse.success(
        res,
        blogs,
        "Related blogs fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const blogs = await BlogService.getFeaturedBlogs(limit);

      return ApiResponse.success(
        res,
        blogs,
        "Featured blogs fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getTrendingBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const blogs = await BlogService.getTrendingBlogs(limit);

      return ApiResponse.success(
        res,
        blogs,
        "Trending blogs fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Category Controllers
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const userId = (req as any).user.userId;
      const categoryData: ICreateCategoryData = req.body;

      const category = await CategoryService.createCategory(
        userId,
        categoryData
      );

      return ApiResponse.success(
        res,
        category,
        "Category created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const category = await CategoryService.getCategoryById(id);

      return ApiResponse.success(
        res,
        category,
        "Category fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const category = await CategoryService.getCategoryBySlug(slug);

      return ApiResponse.success(
        res,
        category,
        "Category fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const query: ICategoryQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string,
        isActive: req.query.isActive as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await CategoryService.getAllCategories(query);

      return ApiResponse.success(
        res,
        result,
        "Categories fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { id } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;
      const updateData: IUpdateCategoryData = req.body;

      const category = await CategoryService.updateCategory(
        id,
        userId,
        userRole,
        updateData
      );

      return ApiResponse.success(
        res,
        category,
        "Category updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      await CategoryService.deleteCategory(id, userId, userRole);

      return ApiResponse.success(res, null, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async toggleCategoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const category = await CategoryService.toggleCategoryStatus(
        id,
        userId,
        userRole
      );

      return ApiResponse.success(
        res,
        category,
        `Category ${category.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogController();
