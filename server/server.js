import './config/mongoose-init.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// MVC Route Imports
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import shippingRuleRoutes from './routes/shippingRuleRoutes.js';
import ShippingRule from './models/ShippingRule.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Seeding Shipping Rules
const seedShippingRules = async () => {
  try {
    const count = await ShippingRule.countDocuments();
    if (count === 0) {
      const defaultRules = [
        { district: 'Erode', shippingCharge: 0, estimatedDeliveryDays: 1, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Coimbatore', shippingCharge: 60, estimatedDeliveryDays: 2, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Salem', shippingCharge: 60, estimatedDeliveryDays: 2, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Chennai', shippingCharge: 99, estimatedDeliveryDays: 3, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Madurai', shippingCharge: 99, estimatedDeliveryDays: 3, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Bangalore', shippingCharge: 120, estimatedDeliveryDays: 4, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Hyderabad', shippingCharge: 150, estimatedDeliveryDays: 5, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Mumbai', shippingCharge: 150, estimatedDeliveryDays: 6, courierPartner: 'DTDC', status: 'Active' },
        { district: 'Delhi', shippingCharge: 180, estimatedDeliveryDays: 7, courierPartner: 'DTDC', status: 'Active' }
      ];
      await ShippingRule.insertMany(defaultRules);
      console.log('Seeded initial shipping rules successfully!');
    }
  } catch (error) {
    console.error('Error seeding shipping rules:', error.message);
  }
};

// Initialize Database
connectDB().then(() => {
  seedShippingRules();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin-panel', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sarees', productRoutes); // Backward compatibility for front-end sarees endpoints
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/shipping-rules', shippingRuleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Static files serving in production
if (process.env.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Gramathu Boutique API is running 🚀",
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send('Gramathu Boutique API Server is running on MongoDB...');
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
