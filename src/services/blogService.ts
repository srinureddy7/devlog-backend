import Blog from "../models/Blog";
import Category from "../models/Category";
import {
  IBlogResponse,
  ICreateBlogData,
  IUpdateBlogData,
  IBlogQuery,
  IPaginatedResponse,
} from "../interfaces/IBlog";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../utils/appError";
import logger from "../utils/logger";
import CacheManager from "../config/cache";
import {
  blogToResponse,
  blogsToResponse,
  paginate,
} from "../utils/responseHelpers";
import { buildBlogQuery, buildSortOptions } from "../utils/searchHelper";

class BlogService {
  private cache = CacheManager;

  async createBlog(
    userId: string,
    data: ICreateBlogData
  ): Promise<IBlogResponse> {
    try {
      let categoryId = data.categoryId;

      // If categoryName is provided, create or get category
      if (data.categoryName && !data.categoryId) {
        const category = await Category.findOne({
          name: { $regex: new RegExp(`^${data.categoryName}$`, "i") },
          isActive: true,
        });

        if (category) {
          categoryId = category._id.toString();
        } else {
          // Create new category
          const newCategory = await Category.create({
            name: data.categoryName,
            createdBy: userId,
          });
          categoryId = newCategory._id.toString();
          this.cache.delPattern("categories:*");
        }
      }

      // Validate category
      if (!categoryId) {
        throw new BadRequestError("Category is required");
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        throw new BadRequestError("Category not found");
      }

      if (!category.isActive) {
        throw new BadRequestError("Category is not active");
      }

      // Create blog
      const blog = await Blog.create({
        ...data,
        author: userId,
        category: categoryId,
        tags: data.tags?.map((tag) => tag.toLowerCase()) || [],
      });

      // Invalidate cache
      this.cache.delPattern(`blogs:*`);
      this.cache.delPattern(`user:${userId}:blogs:*`);
      this.cache.delPattern(`category:${categoryId}:blogs:*`);

      logger.info(`Blog created: ${blog.title} by user ${userId}`);
      return await blogToResponse(blog);
    } catch (error) {
      logger.error("Create blog error:", error);
      throw error;
    }
  }

  async getBlogById(
    blogId: string,
    incrementViews: boolean = false
  ): Promise<IBlogResponse> {
    try {
      // Try cache first
      const cacheKey = `blog:${blogId}`;
      const cachedBlog = this.cache.get<IBlogResponse>(cacheKey);

      if (cachedBlog && !incrementViews) {
        return cachedBlog;
      }

      // Get from database with population
      const blog = await Blog.findById(blogId)
        .populate("author", "username email avatar firstName lastName")
        .populate("category", "name slug");

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      // Check if blog is published
      if (blog.status !== "published") {
        throw new NotFoundError("Blog not found");
      }

      // Increment views if requested
      if (incrementViews) {
        await blog.incrementViews();
        this.cache.del(cacheKey); // Invalidate cache
      }

      const blogResponse = await blogToResponse(blog);

      // Cache the response (without incrementing views)
      if (!incrementViews) {
        this.cache.set(cacheKey, blogResponse);
      }

      return blogResponse;
    } catch (error) {
      logger.error("Get blog by ID error:", error);
      throw error;
    }
  }

  async getBlogBySlug(
    slug: string,
    incrementViews: boolean = false
  ): Promise<IBlogResponse> {
    try {
      const cacheKey = `blog:slug:${slug}`;
      const cachedBlog = this.cache.get<IBlogResponse>(cacheKey);

      if (cachedBlog && !incrementViews) {
        return cachedBlog;
      }

      const blog = await Blog.findOne({ slug })
        .populate("author", "username email avatar firstName lastName")
        .populate("category", "name slug");

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      if (blog.status !== "published") {
        throw new NotFoundError("Blog not found");
      }

      if (incrementViews) {
        await blog.incrementViews();
        this.cache.del(cacheKey);
      }

      const blogResponse = await blogToResponse(blog);

      if (!incrementViews) {
        this.cache.set(cacheKey, blogResponse);
      }

      return blogResponse;
    } catch (error) {
      logger.error("Get blog by slug error:", error);
      throw error;
    }
  }

  async getAllBlogs(
    query: IBlogQuery = {}
  ): Promise<IPaginatedResponse<IBlogResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        tag,
        status,
        author,
        sortBy = "createdAt",
        sortOrder = "desc",
        featured,
      } = query;
      const skip = (page - 1) * limit;

      // Build cache key
      const cacheKey = `blogs:${JSON.stringify(query)}`;
      const cachedResult =
        this.cache.get<IPaginatedResponse<IBlogResponse>>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      // Build query
      const filter = buildBlogQuery({
        search,
        category,
        tag,
        status,
        author,
        featured,
      });
      const sortOptions = buildSortOptions(sortBy, sortOrder);

      // Get blogs with pagination
      const [blogs, total] = await Promise.all([
        Blog.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .populate("author", "username email avatar firstName lastName")
          .populate("category", "name slug")
          .lean(),
        Blog.countDocuments(filter),
      ]);

      // Convert to response objects
      const data = await Promise.all(
        blogs.map(async (blog: any) => {
          const blogDoc = new Blog(blog);
          return await blogToResponse(blogDoc);
        })
      );

      const result = paginate(data, total, page, limit);

      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Get all blogs error:", error);
      throw error;
    }
  }

  async getUserBlogs(
    userId: string,
    query: IBlogQuery = {}
  ): Promise<IPaginatedResponse<IBlogResponse>> {
    try {
      const cacheKey = `user:${userId}:blogs:${JSON.stringify(query)}`;
      const cachedResult =
        this.cache.get<IPaginatedResponse<IBlogResponse>>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      // Add user filter to query
      const userQuery = { ...query, author: userId };
      const result = await this.getAllBlogs(userQuery);

      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error("Get user blogs error:", error);
      throw error;
    }
  }

  async updateBlog(
    blogId: string,
    userId: string,
    userRole: string,
    data: IUpdateBlogData
  ): Promise<IBlogResponse> {
    try {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      // Check permissions (only author or admin can update)
      if (userRole !== "admin" && blog.author.toString() !== userId) {
        throw new ForbiddenError(
          "You don't have permission to update this blog"
        );
      }

      // Handle category update if provided
      if (data.categoryId) {
        const category = await Category.findById(data.categoryId);
        if (!category) {
          throw new BadRequestError("Category not found");
        }
        if (!category.isActive) {
          throw new BadRequestError("Category is not active");
        }
        blog.category = data.categoryId;
        delete data.categoryId;
      }

      // Update blog
      Object.assign(blog, data);

      // Handle tags
      if (data.tags) {
        blog.tags = data.tags.map((tag) => tag.toLowerCase());
      }

      await blog.save();

      // Invalidate cache
      this.cache.del(`blog:${blogId}`);
      this.cache.del(`blog:slug:${blog.slug}`);
      this.cache.delPattern(`blogs:*`);
      this.cache.delPattern(`user:${userId}:blogs:*`);
      this.cache.delPattern(`category:${blog.category}:blogs:*`);

      logger.info(`Blog updated: ${blogId} by user ${userId}`);
      return await blogToResponse(blog);
    } catch (error) {
      logger.error("Update blog error:", error);
      throw error;
    }
  }

  async deleteBlog(
    blogId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    try {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      // Check permissions (only author or admin can delete)
      if (userRole !== "admin" && blog.author.toString() !== userId) {
        throw new ForbiddenError(
          "You don't have permission to delete this blog"
        );
      }

      // Delete blog
      await Blog.findByIdAndDelete(blogId);

      // Invalidate cache
      this.cache.del(`blog:${blogId}`);
      this.cache.del(`blog:slug:${blog.slug}`);
      this.cache.delPattern(`blogs:*`);
      this.cache.delPattern(`user:${userId}:blogs:*`);
      this.cache.delPattern(`category:${blog.category}:blogs:*`);

      logger.info(`Blog deleted: ${blogId} by user ${userId}`);
    } catch (error) {
      logger.error("Delete blog error:", error);
      throw error;
    }
  }

  async likeBlog(blogId: string): Promise<IBlogResponse> {
    try {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      if (blog.status !== "published") {
        throw new BadRequestError("Cannot like an unpublished blog");
      }

      // Increment likes
      await blog.incrementLikes();

      // Invalidate cache
      this.cache.del(`blog:${blogId}`);
      this.cache.del(`blog:slug:${blog.slug}`);
      this.cache.delPattern(`blogs:*`);

      logger.info(`Blog liked: ${blogId}`);
      return await blogToResponse(blog);
    } catch (error) {
      logger.error("Like blog error:", error);
      throw error;
    }
  }

  async getRelatedBlogs(
    blogId: string,
    limit: number = 5
  ): Promise<IBlogResponse[]> {
    try {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        throw new NotFoundError("Blog not found");
      }

      const cacheKey = `blog:${blogId}:related`;
      const cachedResult = this.cache.get<IBlogResponse[]>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const relatedBlogs = await Blog.find({
        category: blog.category,
        _id: { $ne: blogId },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "username email avatar firstName lastName")
        .populate("category", "name slug");

      const result = await blogsToResponse(relatedBlogs);

      // Cache result
      this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      logger.error("Get related blogs error:", error);
      throw error;
    }
  }

  async getFeaturedBlogs(limit: number = 10): Promise<IBlogResponse[]> {
    try {
      const cacheKey = `blogs:featured:${limit}`;
      const cachedResult = this.cache.get<IBlogResponse[]>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const blogs = await Blog.find({
        isFeatured: true,
        status: "published",
      })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate("author", "username email avatar firstName lastName")
        .populate("category", "name slug");

      const result = await blogsToResponse(blogs);

      // Cache result
      this.cache.set(cacheKey, result, 600); // Cache for 10 minutes
      return result;
    } catch (error) {
      logger.error("Get featured blogs error:", error);
      throw error;
    }
  }

  async getTrendingBlogs(limit: number = 10): Promise<IBlogResponse[]> {
    try {
      const cacheKey = `blogs:trending:${limit}`;
      const cachedResult = this.cache.get<IBlogResponse[]>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const blogs = await Blog.find({
        status: "published",
      })
        .sort({ views: -1, likes: -1 })
        .limit(limit)
        .populate("author", "username email avatar firstName lastName")
        .populate("category", "name slug");

      const result = await blogsToResponse(blogs);

      // Cache result
      this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      logger.error("Get trending blogs error:", error);
      throw error;
    }
  }
}

export default new BlogService();
