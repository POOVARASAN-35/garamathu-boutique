import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`Error reading database file: ${collection}`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing database file: ${collection}`, error);
    return false;
  }
};

// Initialize default data if files don't exist
const initDatabase = async () => {
  // 1. Initialize Settings
  const settingsFile = getFilePath('settings');
  if (!fs.existsSync(settingsFile)) {
    const defaultSettings = {
      websiteName: "Gramathu Boutique",
      tagline: "Traditional Elegance with Modern Style",
      logo: "",
      socialLinks: {
        instagram: "https://www.instagram.com/gramathu_design?igsh=eWRmbWp3MXdpbjl6",
        youtube: "https://youtube.com/@ragavi_editz?si=zh_uJLHFO-jSQwzk",
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
    };
    writeData('settings', [defaultSettings]);
  }

  // 2. Initialize Categories
  const categoriesFile = getFilePath('categories');
  const sampleCategories = [
    { id: "cat-1", name: "Kanchi Semi Silk Saree", image1: "/images/categories/kanchi-semi-silk.jpg", image2: "/images/categories/kanchi-semi-silk.jpg", productCount: 11, status: "Active", displayOrder: 1 },
    { id: "cat-2", name: "Borderless Soft Silk Saree", image1: "/images/categories/borderless-soft-silk.jpg", image2: "/images/categories/borderless-soft-silk.jpg", productCount: 8, status: "Active", displayOrder: 2 },
    { id: "cat-3", name: "Silver Zaree", image1: "/images/categories/silver-zaree.jpg", image2: "/images/categories/silver-zaree.jpg", productCount: 11, status: "Active", displayOrder: 3 },
    { id: "cat-4", name: "Gold Zaree", image1: "/images/categories/gold-zaree.jpg", image2: "/images/categories/gold-zaree.jpg", productCount: 14, status: "Active", displayOrder: 4 },
    { id: "cat-5", name: "Foil Print", image1: "/images/categories/foil-print.jpg", image2: "/images/categories/foil-print.jpg", productCount: 9, status: "Active", displayOrder: 5 },
    { id: "cat-6", name: "Cotton", image1: "/images/categories/cotton.jpg", image2: "/images/categories/cotton.jpg", productCount: 15, status: "Active", displayOrder: 6 },
    { id: "cat-7", name: "Sequence Design", image1: "/images/categories/sequence-design.jpg", image2: "/images/categories/sequence-design.jpg", productCount: 7, status: "Active", displayOrder: 7 },
    { id: "cat-8", name: "Borderless Soft Silk", image1: "/images/categories/borderless-soft-silk.jpg", image2: "/images/categories/borderless-soft-silk.jpg", productCount: 6, status: "Active", displayOrder: 8 },
    { id: "cat-9", name: "Dola Silk Saree", image1: "/images/categories/dola-silk.jpg", image2: "/images/categories/dola-silk.jpg", productCount: 10, status: "Active", displayOrder: 9 },
    { id: "cat-10", name: "Handloom Cotton Saree", image1: "/images/categories/handloom-cotton.jpg", image2: "/images/categories/handloom-cotton.jpg", productCount: 12, status: "Active", displayOrder: 10 },
    { id: "cat-11", name: "Jewel Neck Kurtis", image1: "/images/categories/jewel-neck-kurtis.jpg", image2: "/images/categories/jewel-neck-kurtis.jpg", productCount: 8, status: "Active", displayOrder: 11 },
    { id: "cat-12", name: "Katan Silk Saree", image1: "/images/categories/katan-silk.jpg", image2: "/images/categories/katan-silk.jpg", productCount: 9, status: "Active", displayOrder: 12 },
    { id: "cat-13", name: "Kubera Soft Silk Saree", image1: "/images/categories/kubera-soft-silk.jpg", image2: "/images/categories/kubera-soft-silk.jpg", productCount: 13, status: "Active", displayOrder: 13 },
    { id: "cat-14", name: "Mul Mul Cotton Saree", image1: "/images/categories/mul-mul-cotton.jpg", image2: "/images/categories/mul-mul-cotton.jpg", productCount: 10, status: "Active", displayOrder: 14 }
  ];
  if (!fs.existsSync(categoriesFile)) {
    writeData('categories', sampleCategories);
  }

  // 3. Initialize Users (including Pre-hashed Admin)
  const usersFile = getFilePath('users');
  if (!fs.existsSync(usersFile)) {
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash("AdminPassword123!", salt);
    const defaultUsers = [
      {
        id: "usr-admin",
        firstName: "Admin",
        lastName: "Gramathu",
        email: "admin@gramathuboutique.com",
        password: adminHashedPassword,
        role: "admin",
        addresses: [],
        wishlist: [],
        loginHistory: [
          { date: new Date().toISOString(), ip: "127.0.0.1", device: "Admin Portal" }
        ]
      },
      {
        id: "usr-customer1",
        firstName: "Priya",
        lastName: "Raman",
        email: "priya@gmail.com",
        password: await bcrypt.hash("Priya123!", salt),
        role: "customer",
        addresses: [
          { id: "addr-1", street: "10, Periyar Street", district: "Erode", state: "Tamil Nadu", pincode: "638001", phone: "9898989801", isDefault: true }
        ],
        wishlist: ["sar-2", "sar-5"],
        loginHistory: []
      }
    ];
    writeData('users', defaultUsers);
  }

  // 4. Initialize Products (Sarees)
  const sareesFile = getFilePath('sarees');
  if (!fs.existsSync(sareesFile)) {
    const sampleSarees = [
      {
        id: "sar-1",
        name: "Imperial Emerald Kanchi Semi Silk Saree",
        code: "GB-KSS-001",
        sku: "KSS-001-EM",
        description: "Exquisite emerald green semi-silk saree featuring detailed zari border artwork, perfect for festivals and grand family weddings. Captures a classic regal glow with traditional elegance.",
        price: 2499,
        offerPrice: 1899,
        category: "Kanchi Semi Silk Saree",
        stock: 12,
        color: "Emerald Green",
        fabric: "Semi Silk",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
        ],
        seoTitle: "Emerald Green Kanchi Semi Silk Saree | Gramathu Boutique",
        seoDescription: "Shop our signature Emerald Green Semi Silk Saree online. Traditional heavy zari design with beautiful golden embroidery.",
        status: "Active",
        featured: true,
        rating: 4.8,
        reviewsCount: 15
      },
      {
        id: "sar-2",
        name: "Vintage Crimson Borderless Soft Silk Saree",
        code: "GB-BSS-002",
        sku: "BSS-002-CR",
        description: "A borderless, modern style soft silk saree in a stunning crimson hue. Easy to drape, lightweight, and complete with a contrasting gold pallu.",
        price: 3200,
        offerPrice: 2499,
        category: "Borderless Soft Silk Saree",
        stock: 5,
        color: "Crimson Red",
        fabric: "Soft Silk",
        images: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: true,
        rating: 5.0,
        reviewsCount: 8
      },
      {
        id: "sar-3",
        name: "Midnight Silver Zaree Pure Weave Saree",
        code: "GB-SZ-003",
        sku: "SZ-003-MN",
        description: "Striking combination of deep midnight black accented by silver zari woven motifs. Gives off a shimmering constellation aesthetic under boutique lights.",
        price: 1999,
        offerPrice: 1499,
        category: "Silver Zaree",
        stock: 2, // Low stock
        color: "Midnight Black",
        fabric: "Art Silk",
        images: [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: true,
        rating: 4.6,
        reviewsCount: 12
      },
      {
        id: "sar-4",
        name: "Royal Golden Zaree Soft Silk Kanjeevaram",
        code: "GB-GZ-004",
        sku: "GZ-004-RG",
        description: "Elegant mustard gold saree featuring traditional temple borders and broad gold zari threadwork. The fabric is smooth and fits all body silhouettes.",
        price: 4500,
        offerPrice: 3499,
        category: "Gold Zaree",
        stock: 14,
        color: "Mustard Gold",
        fabric: "Soft Silk",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: true,
        rating: 4.9,
        reviewsCount: 22
      },
      {
        id: "sar-5",
        name: "Floral Foil Print Pastel Green Georgette",
        code: "GB-FP-005",
        sku: "FP-005-PG",
        description: "Lightweight pastel green georgette saree printed with shining silver and gold foil blossoms. Beautiful for casual daytime parties and brunches.",
        price: 1500,
        offerPrice: 999,
        category: "Foil Print",
        stock: 0, // Sold out
        color: "Pastel Green",
        fabric: "Georgette",
        images: [
          "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583391265517-35bbdad01209?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: false,
        rating: 4.4,
        reviewsCount: 4
      },
      {
        id: "sar-6",
        name: "Handcrafted Indigo Block Print Cotton Saree",
        code: "GB-COT-006",
        sku: "COT-006-IN",
        description: "100% organic cotton saree dyed in traditional natural indigo colors. Features intricate hand-block prints by rural artisans of Tamil Nadu.",
        price: 1200,
        offerPrice: 799,
        category: "Cotton",
        stock: 20,
        color: "Indigo Blue",
        fabric: "Organic Cotton",
        images: [
          "https://images.unsplash.com/photo-1583391265517-35bbdad01209?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: true,
        rating: 4.7,
        reviewsCount: 19
      },
      {
        id: "sar-7",
        name: "Golden Dola Silk Designer Saree",
        code: "GB-DS-007",
        sku: "DS-007-GL",
        description: "Exquisite Dola Silk saree featuring soft textures, digital floral patterns, and a glittering gold embroidery lace outline.",
        price: 2500,
        offerPrice: 1799,
        category: "Dola Silk Saree",
        stock: 9,
        color: "Honey Gold",
        fabric: "Dola Silk",
        images: [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: false,
        rating: 4.5,
        reviewsCount: 6
      },
      {
        id: "sar-8",
        name: "Kubera Soft Silk Wedding Special Saree",
        code: "GB-KSS-008",
        sku: "KSS-008-RD",
        description: "Premium Kubera Silk Saree in traditional bridal red. The heavy gold brocade patterns represent divine prosperity and royalty.",
        price: 4999,
        offerPrice: 3899,
        category: "Kubera Soft Silk Saree",
        stock: 15,
        color: "Bridal Red",
        fabric: "Kubera Silk",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
        ],
        status: "Active",
        featured: true,
        rating: 5.0,
        reviewsCount: 34
      }
    ];
    writeData('sarees', sampleSarees);
  }

  // 5. Initialize Reviews
  const reviewsFile = getFilePath('reviews');
  if (!fs.existsSync(reviewsFile)) {
    const defaultReviews = [
      { id: "rev-1", name: "Priya", rating: 5, comment: "Excellent Quality.", date: new Date().toISOString() },
      { id: "rev-2", name: "Lakshmi", rating: 5, comment: "Worth Buying.", date: new Date().toISOString() },
      { id: "rev-3", name: "Meena", rating: 5, comment: "Beautiful Saree.", date: new Date().toISOString() },
      { id: "rev-4", name: "Divya", rating: 5, comment: "Very Fast Delivery.", date: new Date().toISOString() },
      { id: "rev-5", name: "Anitha", rating: 5, comment: "Loved the Fabric.", date: new Date().toISOString() },
      { id: "rev-6", name: "Kavya", rating: 5, comment: "Premium Collection.", date: new Date().toISOString() },
      { id: "rev-7", name: "Revathi", rating: 5, comment: "Highly Recommended.", date: new Date().toISOString() }
    ];
    writeData('reviews', defaultReviews);
  }

  // 6. Initialize Banners
  const bannersFile = getFilePath('banners');
  if (!fs.existsSync(bannersFile)) {
    const defaultBanners = [
      {
        id: "ban-1",
        title: "Traditional Elegance",
        subtitle: "Luxury Heritage Sarees",
        description: "Handcrafted silk sarees capturing the royal grandeur of Kanchipuram weaves.",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80",
        link: "/collection/Kanchi%20Semi%20Silk%20Saree",
        status: "Active"
      },
      {
        id: "ban-2",
        title: "Kubera Silk Collection",
        subtitle: "Auspicious Silks for Festive Occasions",
        description: "Embody divine aesthetics with rich zari weaves and vibrant contrast colors.",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=80",
        link: "/collection/Kubera%20Soft%20Silk%20Saree",
        status: "Active"
      },
      {
        id: "ban-3",
        title: "Modern Soft Silks",
        subtitle: "Borderless Grace",
        description: "Lightweight and pastel-toned sarees perfect for matching the modern woman's lifestyle.",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80",
        link: "/collection/Borderless%20Soft%20Silk%20Saree",
        status: "Active"
      }
    ];
    writeData('banners', defaultBanners);
  }

  // 7. Initialize Orders
  const ordersFile = getFilePath('orders');
  if (!fs.existsSync(ordersFile)) {
    const defaultOrders = [
      {
        id: "GB-ORD-1001",
        customerId: "usr-customer1",
        customerName: "Priya Raman",
        email: "priya@gmail.com",
        items: [
          { productId: "sar-1", name: "Imperial Emerald Kanchi Semi Silk Saree", price: 1899, quantity: 1, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200" }
        ],
        subtotal: 1899,
        shippingFee: 0, // Erode address
        discount: 0,
        total: 1899,
        shippingAddress: {
          street: "10, Periyar Street",
          district: "Erode",
          state: "Tamil Nadu",
          pincode: "638001",
          phone: "9898989801"
        },
        paymentStatus: "Paid",
        orderStatus: "Delivered",
        paymentMethod: "Razorpay",
        trackingNumber: "GBTRK9876123",
        notes: "Deliver in the evening",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "GB-ORD-1002",
        customerId: "usr-customer1",
        customerName: "Priya Raman",
        email: "priya@gmail.com",
        items: [
          { productId: "sar-3", name: "Midnight Silver Zaree Pure Weave Saree", price: 1499, quantity: 1, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200" }
        ],
        subtotal: 1499,
        shippingFee: 120, // Chennai shipping applied
        discount: 0,
        total: 1619,
        shippingAddress: {
          street: "45, Anna Nagar First Cross",
          district: "Chennai",
          state: "Tamil Nadu",
          pincode: "600040",
          phone: "9898989801"
        },
        paymentStatus: "Paid",
        orderStatus: "Processing",
        paymentMethod: "Razorpay",
        trackingNumber: "GBTRK9876155",
        notes: "",
        createdAt: new Date().toISOString()
      }
    ];
    writeData('orders', defaultOrders);
  }
};

export const localDb = {
  initDatabase,
  get: (collection) => readData(collection),
  getById: (collection, id) => readData(collection).find(item => item.id === id),
  insert: (collection, doc) => {
    const data = readData(collection);
    const newDoc = { ...doc };
    if (!newDoc.id) {
      newDoc.id = `${collection.slice(0, 3)}-${Date.now()}`;
    }
    data.push(newDoc);
    writeData(collection, data);
    return newDoc;
  },
  update: (collection, id, updates) => {
    const data = readData(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates };
    writeData(collection, data);
    return data[index];
  },
  delete: (collection, id) => {
    const data = readData(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;
    data.splice(index, 1);
    writeData(collection, data);
    return true;
  }
};
