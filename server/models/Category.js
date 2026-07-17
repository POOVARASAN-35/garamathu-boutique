import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    categoryImage: {
      type: String,
      default: '',
    },
    categoryImages: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-slugify categoryName before saving
categorySchema.pre('save', function () {
  if (this.isModified('categoryName')) {
    this.slug = this.categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Keep categoryImage and coverImage in sync for backward compatibility
  if (this.coverImage) {
    this.categoryImage = this.coverImage;
  } else if (this.categoryImages && this.categoryImages.length > 0) {
    this.categoryImage = this.categoryImages[0];
    this.coverImage = this.categoryImages[0];
  } else {
    this.categoryImage = '';
    this.coverImage = '';
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
