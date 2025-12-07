import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { IBlogDocument } from "../interfaces/IBlog";

// Fix for jsdom type issues
const window = new JSDOM("").window;
const DOMPurify = (createDOMPurify as any)(window) as typeof createDOMPurify;

const BlogSchema = new Schema<IBlogDocument>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
      //   minlength: [100, "Content must be at least 100 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    featuredImage: {
      type: String,
      default: "",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: Number,
      default: 0,
      min: [0, "Read time cannot be negative"],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Likes cannot be negative"],
    },
    publishedAt: {
      type: Date,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, "Meta title cannot exceed 70 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for optimized queries
BlogSchema.index({ title: "text", content: "text", excerpt: "text" });
BlogSchema.index({ slug: 1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ isFeatured: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likes: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ "author._id": 1, status: 1 });

// Pre-save middleware
BlogSchema.pre("save", async function (next) {
  if (!this.isModified("title") && !this.isModified("content")) {
    return next();
  }

  try {
    // Generate slug if title is modified
    if (this.isModified("title")) {
      const baseSlug = slugify(this.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      let slug = baseSlug;
      let counter = 1;
      let blogExists = await mongoose.models.Blog.findOne({ slug });

      while (blogExists && blogExists._id.toString() !== this._id?.toString()) {
        slug = `${baseSlug}-${counter}`;
        blogExists = await mongoose.models.Blog.findOne({ slug });
        counter++;
      }

      this.slug = slug;
    }

    // Auto-generate excerpt if not provided
    if (!this.excerpt && this.content) {
      const plainText = this.content.replace(/<[^>]*>/g, ""); // Remove HTML tags
      this.excerpt = plainText.substring(0, 250) + "...";
    }

    // Sanitize content to prevent XSS
    if (this.isModified("content")) {
      // Convert markdown to HTML
      const htmlContent = marked(this.content) as string;
      // Sanitize HTML
      this.content = DOMPurify.sanitize(htmlContent);
    }

    // Calculate read time (assuming average reading speed of 200 words per minute)
    if (this.isModified("content")) {
      const wordCount = this.content.split(/\s+/).length;
      this.readTime = Math.ceil(wordCount / 200);
    }

    // Set publishedAt if status changes to published
    if (
      this.isModified("status") &&
      this.status === "published" &&
      !this.publishedAt
    ) {
      this.publishedAt = new Date();
    }

    // Generate meta tags if not provided
    if (!this.metaTitle && this.title) {
      this.metaTitle = this.title.substring(0, 70);
    }

    if (!this.metaDescription && this.excerpt) {
      this.metaDescription = this.excerpt.substring(0, 160);
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Methods
BlogSchema.methods.incrementViews = async function (): Promise<void> {
  this.views += 1;
  await this.save();
};

BlogSchema.methods.incrementLikes = async function (): Promise<void> {
  this.likes += 1;
  await this.save();
};

BlogSchema.methods.generateSlug = async function (): Promise<string> {
  const baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;
  let blogExists = await mongoose.models.Blog.findOne({ slug });

  while (blogExists && blogExists._id.toString() !== this._id.toString()) {
    slug = `${baseSlug}-${counter}`;
    blogExists = await mongoose.models.Blog.findOne({ slug });
    counter++;
  }

  return slug;
};

// Virtuals for related blogs (will be populated when needed)
BlogSchema.virtual("relatedBlogs", {
  ref: "Blog",
  localField: "category",
  foreignField: "category",
  match: { status: "published" },
  options: { limit: 5, sort: { createdAt: -1 } },
});

const Blog = mongoose.model<IBlogDocument>("Blog", BlogSchema);
export default Blog;
