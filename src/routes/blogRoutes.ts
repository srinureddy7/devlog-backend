import { Router } from "express";
import BlogController from "../controllers/blogController";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import {
  createBlogValidation,
  updateBlogValidation,
  createCategoryValidation,
  updateCategoryValidation,
  blogQueryValidation,
  categoryQueryValidation,
  blogIdParamValidation,
  categoryIdParamValidation,
  slugParamValidation,
} from "../validations/blogValidation";

const router = Router();

// Public routes
router.get("/blogs", blogQueryValidation, BlogController.getAllBlogs);
router.get("/blogs/featured", BlogController.getFeaturedBlogs);
router.get("/blogs/trending", BlogController.getTrendingBlogs);
router.get("/blogs/:id", blogIdParamValidation, BlogController.getBlogById);
router.get(
  "/blogs/slug/:slug",
  slugParamValidation,
  BlogController.getBlogBySlug
);
router.get(
  "/blogs/:id/related",
  blogIdParamValidation,
  BlogController.getRelatedBlogs
);
router.post("/blogs/:id/like", blogIdParamValidation, BlogController.likeBlog);

router.get(
  "/categories",
  categoryQueryValidation,
  BlogController.getAllCategories
);
router.get(
  "/categories/:id",
  categoryIdParamValidation,
  BlogController.getCategoryById
);
router.get(
  "/categories/slug/:slug",
  slugParamValidation,
  BlogController.getCategoryBySlug
);

// Protected routes (require authentication)
router.use(protect);

// User blog routes
router.post("/blogs", createBlogValidation, BlogController.createBlog);
router.get("/user/blogs", blogQueryValidation, BlogController.getUserBlogs);
router.put(
  "/blogs/:id",
  blogIdParamValidation,
  updateBlogValidation,
  BlogController.updateBlog
);
router.delete("/blogs/:id", blogIdParamValidation, BlogController.deleteBlog);

// User category routes
router.post(
  "/categories",
  createCategoryValidation,
  BlogController.createCategory
);
router.put(
  "/categories/:id",
  categoryIdParamValidation,
  updateCategoryValidation,
  BlogController.updateCategory
);
router.patch(
  "/categories/:id/toggle",
  categoryIdParamValidation,
  BlogController.toggleCategoryStatus
);

// Admin only routes
router.use(restrictTo("admin"));
router.delete(
  "/categories/:id",
  categoryIdParamValidation,
  BlogController.deleteCategory
);

export default router;
