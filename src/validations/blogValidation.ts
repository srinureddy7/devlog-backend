import { body, query, param } from "express-validator";
import { Types } from "mongoose";

export const createBlogValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),

  body("featuredImage")
    .optional()
    .isURL()
    .withMessage("Featured image must be a valid URL"),

  body("categoryId")
    .optional()
    .custom((value) => {
      if (value && !Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID");
      }
      return true;
    }),

  body("categoryName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Each tag must be between 2 and 20 characters"),

  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),

  body("metaTitle")
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage("Meta title cannot exceed 70 characters"),

  body("metaDescription")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),

  body("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array"),

  body("keywords.*")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each keyword cannot exceed 30 characters"),
];

export const updateBlogValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("content")
    .optional()
    .isLength({ min: 100 })
    .withMessage("Content must be at least 100 characters"),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),

  body("featuredImage")
    .optional()
    .isURL()
    .withMessage("Featured image must be a valid URL"),

  body("categoryId")
    .optional()
    .custom((value) => {
      if (value && !Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID");
      }
      return true;
    }),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Each tag must be between 2 and 20 characters"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be either 'draft', 'published', or 'archived'"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("metaTitle")
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage("Meta title cannot exceed 70 characters"),

  body("metaDescription")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),

  body("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array"),

  body("keywords.*")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each keyword cannot exceed 30 characters"),
];

export const createCategoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const blogQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),

  query("category")
    .optional()
    .custom((value) => {
      if (value && !Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID");
      }
      return true;
    }),

  query("tag")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Tag cannot exceed 20 characters"),

  query("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be either 'draft', 'published', or 'archived'"),

  query("author")
    .optional()
    .custom((value) => {
      if (value && !Types.ObjectId.isValid(value)) {
        throw new Error("Invalid author ID");
      }
      return true;
    }),

  query("sortBy")
    .optional()
    .isIn([
      "createdAt",
      "updatedAt",
      "publishedAt",
      "title",
      "views",
      "likes",
      "readTime",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either 'asc' or 'desc'"),

  query("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),
];

export const categoryQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  query("sortBy")
    .optional()
    .isIn(["name", "createdAt", "updatedAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];

export const blogIdParamValidation = [
  param("id")
    .notEmpty()
    .withMessage("Blog ID is required")
    .custom((value) => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error("Invalid blog ID");
      }
      return true;
    }),
];

export const categoryIdParamValidation = [
  param("id")
    .notEmpty()
    .withMessage("Category ID is required")
    .custom((value) => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID");
      }
      return true;
    }),
];

export const slugParamValidation = [
  param("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Invalid slug format"),
];
