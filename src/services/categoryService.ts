import Category from "../models/Category";
import Blog from "../models/Blog";
import {
  ICategoryResponse,
  ICreateCategoryData,
  IUpdateCategoryData,
  ICategoryQuery,
  IPaginatedResponse,
} from "../interfaces/IBlog";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../utils/appError";
import logger from "../utils/logger";
import CacheManager from "../config/cache";
import { categoryToResponse, paginate } from "../utils/responseHelpers";
import { buildCategoryQuery, buildSortOptions } from "../utils/searchHelper";

class CategoryService {
  private cache = CacheManager;

  async createCategory(
    userId: string,
    data: ICreateCategoryData
  ): Promise<ICategoryResponse> {
    try {
      // Check if category already exists
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (existingCategory) {
        throw new BadRequestError("Category with this name already exists");
      }

      // Create new category
      const category = await Category.create({
        ...data,
        createdBy: userId,
      });

      // Invalidate cache
      this.cache.delPattern("categories:*");

      logger.info(`Category created: ${category.name} by user ${userId}`);
      return await categoryToResponse(category);
    } catch (error) {
      logger.error("Create category error:", error);
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<ICategoryResponse> {
    try {
      // Try cache first
      const cacheKey = `category:${categoryId}`;
      const cachedCategory = this.cache.get<ICategoryResponse>(cacheKey);

      if (cachedCategory) {
        return cachedCategory;
      }

      // Get from database with population
      const category = await Category.findById(categoryId)
        .populate("createdBy", "username email")
        .lean();

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Get blog count
      const blogCount = await Blog.countDocuments({
        category: categoryId,
        status: "published",
      });

      const categoryResponse: ICategoryResponse = {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdBy: {
          id: (category.createdBy as any)._id.toString(),
          username: (category.createdBy as any).username,
          email: (category.createdBy as any).email,
        },
        blogCount,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      // Cache the response
      this.cache.set(cacheKey, categoryResponse);
      return categoryResponse;
    } catch (error) {
      logger.error("Get category by ID error:", error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<ICategoryResponse> {
    try {
      const cacheKey = `category:slug:${slug}`;
      const cachedCategory = this.cache.get<ICategoryResponse>(cacheKey);

      if (cachedCategory) {
        return cachedCategory;
      }

      const category = await Category.findOne({ slug })
        .populate("createdBy", "username email")
        .lean();

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      const blogCount = await Blog.countDocuments({
        category: category._id,
        status: "published",
      });

      const categoryResponse: ICategoryResponse = {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdBy: {
          id: (category.createdBy as any)._id.toString(),
          username: (category.createdBy as any).username,
          email: (category.createdBy as any).email,
        },
        blogCount,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      this.cache.set(cacheKey, categoryResponse);
      return categoryResponse;
    } catch (error) {
      logger.error("Get category by slug error:", error);
      throw error;
    }
  }

  async getAllCategories(
    query: ICategoryQuery = {}
  ): Promise<IPaginatedResponse<ICategoryResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        sortBy = "name",
        sortOrder = "asc",
      } = query;
      const skip = (page - 1) * limit;

      // Build cache key
      const cacheKey = `categories:${JSON.stringify(query)}`;
      const cachedResult =
        this.cache.get<IPaginatedResponse<ICategoryResponse>>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      // Build query
      const filter = buildCategoryQuery({ search, isActive });
      const sortOptions = buildSortOptions(sortBy, sortOrder);

      // Get categories with pagination
      const [categories, total] = await Promise.all([
        Category.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .populate("createdBy", "username email")
          .lean(),
        Category.countDocuments(filter),
      ]);

      // Get blog counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const blogCount = await Blog.countDocuments({
            category: category._id,
            status: "published",
          });

          return {
            ...category,
            blogCount,
          };
        })
      );

      // Convert to response objects
      const data: ICategoryResponse[] = categoriesWithCounts.map(
        (category) => ({
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdBy: {
            id: (category.createdBy as any)._id.toString(),
            username: (category.createdBy as any).username,
            email: (category.createdBy as any).email,
          },
          blogCount: category.blogCount,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })
      );

      const result = paginate(data, total, page, limit);

      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Get all categories error:", error);
      throw error;
    }
  }

  async updateCategory(
    categoryId: string,
    userId: string,
    userRole: string,
    data: IUpdateCategoryData
  ): Promise<ICategoryResponse> {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Check permissions (only admin or creator can update)
      if (userRole !== "admin" && category.createdBy.toString() !== userId) {
        throw new ForbiddenError(
          "You don't have permission to update this category"
        );
      }

      // Check if new name conflicts with existing category
      if (data.name && data.name !== category.name) {
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${data.name}$`, "i") },
          _id: { $ne: categoryId },
        });

        if (existingCategory) {
          throw new BadRequestError("Category with this name already exists");
        }
      }

      // Update category
      Object.assign(category, data);
      await category.save();

      // Invalidate cache
      this.cache.del(`category:${categoryId}`);
      this.cache.delPattern("categories:*");

      logger.info(`Category updated: ${categoryId} by user ${userId}`);
      return await categoryToResponse(category);
    } catch (error) {
      logger.error("Update category error:", error);
      throw error;
    }
  }

  async deleteCategory(
    categoryId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Check permissions (only admin can delete)
      if (userRole !== "admin") {
        throw new ForbiddenError("Only admin can delete categories");
      }

      // Check if category has blogs
      const blogCount = await Blog.countDocuments({ category: categoryId });
      if (blogCount > 0) {
        throw new BadRequestError("Cannot delete category with existing blogs");
      }

      // Delete category
      await Category.findByIdAndDelete(categoryId);

      // Invalidate cache
      this.cache.del(`category:${categoryId}`);
      this.cache.delPattern("categories:*");

      logger.info(`Category deleted: ${categoryId} by user ${userId}`);
    } catch (error) {
      logger.error("Delete category error:", error);
      throw error;
    }
  }

  async toggleCategoryStatus(
    categoryId: string,
    userId: string,
    userRole: string
  ): Promise<ICategoryResponse> {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      // Check permissions (only admin or creator can toggle)
      if (userRole !== "admin" && category.createdBy.toString() !== userId) {
        throw new ForbiddenError(
          "You don't have permission to update this category"
        );
      }

      // Toggle status
      category.isActive = !category.isActive;
      await category.save();

      // Invalidate cache
      this.cache.del(`category:${categoryId}`);
      this.cache.delPattern("categories:*");

      logger.info(
        `Category status toggled: ${categoryId} to ${category.isActive} by user ${userId}`
      );
      return await categoryToResponse(category);
    } catch (error) {
      logger.error("Toggle category status error:", error);
      throw error;
    }
  }
}

export default new CategoryService();
