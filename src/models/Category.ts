import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { ICategoryDocument } from "../interfaces/IBlog";

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Category creator is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ createdBy: 1 });
CategorySchema.index({ isActive: 1 });

// Virtual for blog count
CategorySchema.virtual("blogCount", {
  ref: "Blog",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Pre-save middleware to generate slug
CategorySchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    return next();
  }

  try {
    // Generate slug from name
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if slug already exists
    let slug = baseSlug;
    let counter = 1;
    let categoryExists = await mongoose.models.Category.findOne({ slug });

    while (
      categoryExists &&
      categoryExists._id.toString() !== this._id?.toString()
    ) {
      slug = `${baseSlug}-${counter}`;
      categoryExists = await mongoose.models.Category.findOne({ slug });
      counter++;
    }

    this.slug = slug;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to update blog count
CategorySchema.methods.updateBlogCount = async function (): Promise<void> {
  //   const Blog = mongoose.model("Blog");
  //   const count = await Blog.countDocuments({
  //     category: this._id,
  //     status: "published",
  //   });
  // Note: blogCount is a virtual, so we can't directly set it
  // The virtual will handle it automatically when populated
};

const Category = mongoose.model<ICategoryDocument>("Category", CategorySchema);
export default Category;
