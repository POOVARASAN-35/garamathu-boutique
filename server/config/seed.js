import './mongoose-init.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Model Imports
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Review from '../models/Review.js';
import Banner from '../models/Banner.js';
import Contact from '../models/Contact.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Admin from '../models/Admin.js';

dotenv.config();

const categoriesData = [
  { name: "Kanchi Semi Silk Saree", image: "/images/categories/kanchi-semi-silk.jpg", order: 1 },
  { name: "Borderless Soft Silk Saree", image: "/images/categories/borderless-soft-silk.jpg", order: 2 },
  { name: "Silver Zaree", image: "/images/categories/silver-zaree.jpg", order: 3 },
  { name: "Gold Zaree", image: "/images/categories/gold-zaree.jpg", order: 4 },
  { name: "Foil Print", image: "/images/categories/foil-print.jpg", order: 5 },
  { name: "Cotton", image: "/images/categories/cotton.jpg", order: 6 },
  { name: "Sequence Design", image: "/images/categories/sequence-design.jpg", order: 7 },
  { name: "Borderless Soft Silk", image: "/images/categories/borderless-soft-silk.jpg", order: 8 },
  { name: "Dola Silk Saree", image: "/images/categories/dola-silk.jpg", order: 9 },
  { name: "Handloom Cotton Saree", image: "/images/categories/handloom-cotton.jpg", order: 10 },
  { name: "Jewel Neck Kurtis", image: "/images/categories/jewel-neck-kurtis.jpg", order: 11 },
  { name: "Katan Silk Saree", image: "/images/categories/katan-silk.jpg", order: 12 },
  { name: "Kubera Soft Silk Saree", image: "/images/categories/kubera-soft-silk.jpg", order: 13 },
  { name: "Mul Mul Cotton Saree", image: "/images/categories/mul-mul-cotton.jpg", order: 14 }
];

const initialSarees = [
  {
    name: "Imperial Emerald Kanchi Semi Silk Saree",
    code: "GB-KSS-001",
    description: "Exquisite emerald green semi-silk saree featuring detailed zari border artwork, perfect for festivals and grand family weddings. Captures a classic regal glow with traditional elegance.",
    price: 2499,
    offerPrice: 1899,
    category: "Kanchi Semi Silk Saree",
    stock: 12,
    color: "Emerald Green",
    fabric: "Semi Silk",
    images: ["/images/products/prod-7.jpg", "/images/products/prod-10.jpg", "/images/products/prod-11.jpg"],
    featured: true
  },
  {
    name: "Vintage Crimson Borderless Soft Silk Saree",
    code: "GB-BSS-002",
    description: "A borderless, modern style soft silk saree in a stunning crimson hue. Easy to drape, lightweight, and complete with a contrasting gold pallu.",
    price: 3200,
    offerPrice: 2499,
    category: "Borderless Soft Silk Saree",
    stock: 5,
    color: "Crimson Red",
    fabric: "Soft Silk",
    images: ["/images/products/prod-11.jpg", "/images/products/prod-10.jpg"],
    featured: true
  },
  {
    name: "Midnight Silver Zaree Pure Weave Saree",
    code: "GB-SZ-003",
    description: "Striking combination of deep midnight black accented by silver zari woven motifs. Gives off a shimmering constellation aesthetic under boutique lights.",
    price: 1999,
    offerPrice: 1499,
    category: "Silver Zaree",
    stock: 2,
    color: "Midnight Black",
    fabric: "Art Silk",
    images: ["/images/products/prod-10.jpg", "/images/products/prod-7.jpg"],
    featured: true
  },
  {
    name: "Royal Golden Zaree Soft Silk Kanjeevaram",
    code: "GB-GZ-004",
    description: "Elegant mustard gold saree featuring traditional temple borders and broad gold zari threadwork. The fabric is smooth and fits all body silhouettes.",
    price: 4500,
    offerPrice: 3499,
    category: "Kanchi Semi Silk Saree",
    stock: 14,
    color: "Mustard Gold",
    fabric: "Soft Silk",
    images: ["/images/products/prod-7.jpg", "/images/products/prod-11.jpg"],
    featured: true
  },
  {
    name: "Floral Foil Print Pastel Green Georgette",
    code: "GB-FP-005",
    description: "Lightweight pastel green georgette saree printed with shining silver and gold foil blossoms. Beautiful for casual daytime parties and brunches.",
    price: 1500,
    offerPrice: 999,
    category: "Borderless Soft Silk Saree",
    stock: 0,
    color: "Pastel Green",
    fabric: "Georgette",
    images: ["/images/products/prod-4.jpg"],
    featured: false
  },
  {
    name: "Handcrafted Indigo Block Print Cotton Saree",
    code: "GB-COT-006",
    description: "100% organic cotton saree dyed in traditional natural indigo colors. Features intricate hand-block prints by rural artisans of Tamil Nadu.",
    price: 1200,
    offerPrice: 799,
    category: "Silver Zaree",
    stock: 20,
    color: "Indigo Blue",
    fabric: "Organic Cotton",
    images: ["/images/products/prod-8.jpg", "/images/products/prod-7.jpg"],
    featured: true
  },
  {
    name: "Golden Dola Silk Designer Saree",
    code: "GB-DS-007",
    description: "Exquisite Dola Silk saree featuring soft textures, digital floral patterns, and a glittering gold embroidery lace outline.",
    price: 2500,
    offerPrice: 1799,
    category: "Kanchi Semi Silk Saree",
    stock: 9,
    color: "Honey Gold",
    fabric: "Dola Silk",
    images: ["/images/products/prod-10.jpg", "/images/products/prod-11.jpg"],
    featured: false
  },
  {
    name: "Kubera Soft Silk Wedding Special Saree",
    code: "GB-KSS-008",
    description: "Premium Kubera Silk Saree in traditional bridal red. The heavy gold brocade patterns represent divine prosperity and royalty.",
    price: 4999,
    offerPrice: 3899,
    category: "Borderless Soft Silk Saree",
    stock: 15,
    color: "Bridal Red",
    fabric: "Kubera Silk",
    images: ["/images/products/prod-7.jpg", "/images/products/prod-11.jpg"],
    featured: true
  },
  {
    name: "Pastel Lilac Borderless Soft Silk Saree",
    code: "GB-BSS-003",
    description: "Premium lilac borderless soft silk saree with self-weave patterns and elegant tassels on the pallu.",
    price: 2999,
    offerPrice: 2200,
    category: "Borderless Soft Silk Saree",
    stock: 10,
    color: "Lilac Pink",
    fabric: "Soft Silk",
    images: ["/images/products/prod-11.jpg", "/images/products/prod-10.jpg"],
    featured: false
  },
  {
    name: "Powder Blue Borderless Soft Silk Saree",
    code: "GB-BSS-004",
    description: "Stunning powder blue soft silk saree featuring contemporary floral motifs and lightweight feel.",
    price: 3100,
    offerPrice: 2399,
    category: "Borderless Soft Silk Saree",
    stock: 8,
    color: "Powder Blue",
    fabric: "Soft Silk",
    images: ["/images/products/prod-10.jpg", "/images/products/prod-7.jpg"],
    featured: false
  },
  {
    name: "Mint Green Borderless Soft Silk Saree",
    code: "GB-BSS-005",
    description: "Mint green borderless silk with subtle gold weave structures, ideal for morning rituals.",
    price: 2800,
    offerPrice: 1999,
    category: "Borderless Soft Silk Saree",
    stock: 4,
    color: "Mint Green",
    fabric: "Soft Silk",
    images: ["/images/products/prod-4.jpg", "/images/products/prod-11.jpg"],
    featured: false
  },
  {
    name: "Peach Cream Borderless Soft Silk Saree",
    code: "GB-BSS-006",
    description: "Luxurious cream saree with peach undertones and full borderless body weave patterns.",
    price: 3000,
    offerPrice: 2150,
    category: "Borderless Soft Silk Saree",
    stock: 12,
    color: "Peach Cream",
    fabric: "Soft Silk",
    images: ["/images/products/prod-7.jpg", "/images/products/prod-10.jpg"],
    featured: false
  },
  {
    name: "Dusty Rose Borderless Soft Silk Saree",
    code: "GB-BSS-007",
    description: "Soft dusty rose weave with silver thread patterns detailing the borderless edges.",
    price: 3300,
    offerPrice: 2499,
    category: "Borderless Soft Silk Saree",
    stock: 9,
    color: "Dusty Rose",
    fabric: "Soft Silk",
    images: ["/images/products/prod-11.jpg", "/images/products/prod-10.jpg"],
    featured: false
  },
  {
    name: "Traditional Madurai Sungudi Cotton Saree",
    code: "GB-COT-007",
    description: "Madurai Sungudi tie-dye cotton saree with beautiful zari borders and hand-dyed patterns.",
    price: 1100,
    offerPrice: 699,
    category: "Borderless Soft Silk Saree",
    stock: 15,
    color: "Mustard Yellow",
    fabric: "Sungudi Cotton",
    images: ["/images/products/prod-8.jpg", "/images/products/prod-7.jpg"],
    featured: false
  },
  {
    name: "Chettinad Checked Cotton Saree",
    code: "GB-COT-008",
    description: "Classic Chettinad checked pattern cotton saree with a thick golden weave stripe border.",
    price: 1300,
    offerPrice: 850,
    category: "Silver Zaree",
    stock: 10,
    color: "Green Checked",
    fabric: "Chettinad Cotton",
    images: ["/images/products/prod-8.jpg", "/images/products/prod-11.jpg"],
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/gramathu-boutique';
    console.log(`Seeding standalone database at: ${connString}`);
    await mongoose.connect(connString);

    console.log('Clearing old collections...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Settings.deleteMany({});
    await Review.deleteMany({});
    await Banner.deleteMany({});
    await Contact.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});

    // 1. Seed Categories
    console.log('Seeding categories...');
    const createdCategories = [];
    for (const cat of categoriesData) {
      const newCat = new Category({
        categoryName: cat.name,
        categoryImage: cat.image,
        description: `${cat.name} Collection`,
        displayOrder: cat.order,
        status: true
      });
      await newCat.save();
      createdCategories.push(newCat);
    }
    console.log(`Seeded ${createdCategories.length} categories.`);

    // 2. Seed Products (1-3 products per category)
    console.log('Seeding products...');
    const insertedCodes = new Set();
    let productSeededCount = 0;

    // Local product images round-robin index
    let imageRotationIndex = 1;
    const getNextLocalImage = () => {
      const imgPath = `/images/products/prod-${imageRotationIndex}.jpg`;
      imageRotationIndex = (imageRotationIndex % 11) + 1; // 1 to 11
      return imgPath;
    };

    for (const category of createdCategories) {
      // Find matching sarees from our hardcoded initial list
      const matchingSarees = initialSarees.filter(
        s => s.category.toLowerCase().trim() === category.categoryName.toLowerCase().trim()
      );

      const productsToInsert = [];

      // Add matching sarees
      for (const saree of matchingSarees) {
        productsToInsert.push({
          categoryId: category._id,
          productName: saree.name,
          productCode: saree.code,
          description: saree.description,
          price: saree.price,
          offerPrice: saree.offerPrice,
          stock: saree.stock,
          images: saree.images,
          fabric: saree.fabric,
          color: saree.color,
          isFeatured: saree.featured,
          isCombo: false,
          status: 'Active'
        });
      }

      // Ensure every single category gets at least 2 distinct products
      if (productsToInsert.length < 2) {
        const countNeeded = 2 - productsToInsert.length;
        for (let i = 1; i <= countNeeded; i++) {
          const suffix = i === 1 ? 'Royal' : 'Signature';
          const name = `${suffix} ${category.categoryName}`;
          const codeSuffix = category.categoryName.split(' ').map(w => w[0]).join('').toUpperCase();
          const code = `GB-${codeSuffix}-00${i + 1}`;
          
          // Generate 2 different local images for the product
          const img1 = getNextLocalImage();
          const img2 = getNextLocalImage();

          productsToInsert.push({
            categoryId: category._id,
            productName: name,
            productCode: code,
            description: `Exquisite handcrafted ${category.categoryName} featuring rich textures, beautiful threadwork, and soft lightweight feel. Perfect for luxury boutique styles.`,
            price: 2999 + (i * 400),
            offerPrice: 2199 + (i * 200),
            stock: 10,
            images: [img1, img2],
            fabric: 'Silk Blend',
            color: i === 1 ? 'Terracotta Red' : 'Sienna Coral',
            isFeatured: i === 1,
            isCombo: false,
            status: 'Active'
          });
        }
      }

      // Save products to DB
      for (const prodData of productsToInsert) {
        let finalCode = prodData.productCode;
        if (insertedCodes.has(finalCode)) {
          finalCode = `${finalCode}-C${category.displayOrder}`;
        }
        insertedCodes.add(finalCode);
        prodData.productCode = finalCode;

        const newProduct = new Product(prodData);
        await newProduct.save();
        productSeededCount++;
      }
    }
    console.log(`Seeded ${productSeededCount} products.`);

    // 3. Seed Settings
    console.log('Seeding settings...');
    const websiteSettings = new Settings({
      websiteName: "Gramathu Boutique",
      tagline: "Traditional Elegance with Modern Style",
      logo: "",
      socialLinks: {
        instagram: "https://www.instagram.com/gramathu_design?igsh=eWRmbWp3MXdpbjl6",
        youtube: "https://youtube.com/gramathu_boutique",
        whatsapp: "https://whatsapp.com/channel/0029VbDFeYJ30LKIkbZJhx0k"
      },
      contact: {
        phone: "+91 63694 68700",
        email: "contact@gramathuboutique.com",
        address: "12, Saree Bazaar Street, Erode, Tamil Nadu - 638001"
      },
      shipping: {
        freeShippingDistrict: "Erode",
        defaultShippingCharge: 120,
        estimatedDeliveryDays: "3-5 Days"
      },
      seo: {
        title: "Gramathu Boutique | Traditional Elegance with Modern Style",
        metaDescription: "Explore a luxurious collection of premium Kanchi Semi Silk, Kubera Soft Silk, Silver Zaree, and Cotton sarees at Gramathu Boutique."
      }
    });
    await websiteSettings.save();

    // 4. Seed Admins
    console.log('Seeding admins...');
    const adminUser = new Admin({
      fullName: "Super Admin",
      email: "admin@gramathuboutique.com",
      password: "admin123",
      role: "Super Admin",
      status: true
    });
    await adminUser.save();

    // 4. Seed Users
    console.log('Seeding users...');
    const customerUser = new User({
      firstName: "Priya",
      lastName: "Raman",
      email: "priya@gmail.com",
      password: "user123",
      role: "customer",
      addresses: [
        {
          street: "10, Periyar Street",
          district: "Erode",
          state: "Tamil Nadu",
          pincode: "638001",
          phone: "9898989801",
          isDefault: true
        }
      ],
      wishlist: []
    });
    await customerUser.save();

    // 5. Seed Banners
    console.log('Seeding banners...');
    const bannersData = [
      {
        title: "Traditional Elegance",
        subtitle: "Luxury Heritage Sarees",
        description: "Handcrafted silk sarees capturing the royal grandeur of Kanchipuram weaves.",
        image: "/images/products/prod-1.jpg",
        link: "/collection/Kanchi%20Semi%20Silk%20Saree",
        status: "Active"
      },
      {
        title: "Kubera Silk Collection",
        subtitle: "Auspicious Silks for Festive Occasions",
        description: "Embody divine aesthetics with rich zari weaves and vibrant contrast colors.",
        image: "/images/products/prod-2.jpg",
        link: "/collection/Kubera%20Soft%20Silk%20Saree",
        status: "Active"
      },
      {
        title: "Modern Soft Silks",
        subtitle: "Borderless Grace",
        description: "Lightweight and pastel-toned sarees perfect for matching the modern woman's lifestyle.",
        image: "/images/products/prod-3.jpg",
        link: "/collection/Borderless%20Soft%20Silk%20Saree",
        status: "Active"
      }
    ];

    for (const ban of bannersData) {
      const newBanner = new Banner(ban);
      await newBanner.save();
    }

    // 6. Seed Reviews
    console.log('Seeding reviews...');
    const reviewsData = [
      { userName: "Priya", rating: 5, comment: "Excellent Quality." },
      { userName: "Lakshmi", rating: 5, comment: "Worth Buying." },
      { userName: "Meena", rating: 5, comment: "Beautiful Saree." },
      { userName: "Divya", rating: 5, comment: "Very Fast Delivery." },
      { userName: "Anitha", rating: 5, comment: "Loved the Fabric." },
      { userName: "Kavya", rating: 5, comment: "Premium Collection." },
      { userName: "Revathi", rating: 5, comment: "Highly Recommended." }
    ];

    for (const rev of reviewsData) {
      const newReview = new Review(rev);
      await newReview.save();
    }

    console.log('Standalone seed script executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
