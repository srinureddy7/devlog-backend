import { FilterQuery } from "mongoose";
import { IBlogDocument, ICategoryDocument } from "../interfaces/IBlog";

export const buildBlogQuery = (query: any): FilterQuery<IBlogDocument> => {
  const filter: FilterQuery<IBlogDocument> = {};

  // Status filter (default to published for public queries)
  if (query.status) {
    filter.status = query.status;
  } else if (!query.author) {
    // For public queries, only show published blogs
    filter.status = "published";
  }

  // Search filter
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Category filter
  if (query.category) {
    filter.category = query.category;
  }

  // Tag filter
  if (query.tag) {
    filter.tags = { $in: [query.tag.toLowerCase()] };
  }

  // Author filter
  if (query.author) {
    filter.author = query.author;
  }

  // Featured filter
  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  return filter;
};

export const buildCategoryQuery = (
  query: any
): FilterQuery<ICategoryDocument> => {
  const filter: FilterQuery<ICategoryDocument> = {};

  // Active filter
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  // Search filter
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  return filter;
};

export const buildSortOptions = (
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
) => {
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
  return sortOptions;
};
