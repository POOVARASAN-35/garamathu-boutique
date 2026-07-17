import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      default: 'Gramathu Boutique',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    // Compatibility fields for legacy storefront codes
    price: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isCombo: {
      type: Boolean,
      default: false,
    },
    // Main pricing fields
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price must be greater than or equal to 0'],
    },
    offerPrice: {
      type: Number,
      min: [0, 'Offer price must be greater than or equal to 0'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 5,
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Pre Booking'],
      default: 'In Stock',
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    fabric: {
      type: String,
      default: '',
    },
    sareeLength: {
      type: String,
      default: '5.5 Meters',
    },
    blousePiece: {
      type: String,
      enum: ['Included', 'Not Included'],
      default: 'Included',
    },
    blouseFabric: {
      type: String,
      default: '',
    },
    borderType: {
      type: String,
      default: '',
    },
    weavingType: {
      type: String,
      default: '',
    },
    workType: {
      type: String,
      default: '',
    },
    pattern: {
      type: String,
      default: '',
    },
    occasion: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '450 grams',
    },
    washCare: {
      type: String,
      default: 'Dry clean only',
    },
    primaryColor: {
      type: String,
      default: '',
    },
    secondaryColor: {
      type: String,
      default: '',
    },
    colorTheme: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: '',
    },
    videos: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    comboProduct: {
      type: Boolean,
      default: false,
    },
    hotSelling: {
      type: Boolean,
      default: false,
    },
    limitedEdition: {
      type: Boolean,
      default: false,
    },
    todayDeal: {
      type: Boolean,
      default: false,
    },
    shippingWeight: {
      type: Number,
      default: 0,
    },
    shippingLength: {
      type: Number,
      default: 0,
    },
    shippingWidth: {
      type: Number,
      default: 0,
    },
    shippingHeight: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
    seoKeywords: {
      type: String,
      default: '',
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Hidden'],
      default: 'Active',
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Auto-slugify productName and align compatibility fields before saving
productSchema.pre('save', function () {
  if (this.isModified('productName') && this.productName && this.productCode) {
    this.slug = `${this.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${this.productCode.toLowerCase()}`;
  }

  // Cross-sync originalPrice and legacy price
  if (this.originalPrice !== undefined) {
    this.price = this.originalPrice;
  } else if (this.price !== undefined) {
    this.originalPrice = this.price;
  }

  // Cross-sync flags
  if (this.featured !== undefined) {
    this.isFeatured = this.featured;
  } else if (this.isFeatured !== undefined) {
    this.featured = this.isFeatured;
  }

  if (this.comboProduct !== undefined) {
    this.isCombo = this.comboProduct;
  } else if (this.isCombo !== undefined) {
    this.comboProduct = this.isCombo;
  }

  // Calculate discount percentage dynamically if offerPrice is set
  const basePrice = this.originalPrice || this.price || 0;
  if (this.offerPrice && basePrice > 0) {
    this.discountPercentage = Math.round(((basePrice - this.offerPrice) / basePrice) * 100);
    this.discount = this.discountPercentage;
  } else {
    this.discountPercentage = 0;
    this.discount = 0;
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
