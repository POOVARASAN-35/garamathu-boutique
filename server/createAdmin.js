import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({
      email: 'admin@gramathuboutique.com'
    });

    if (existing) {
      console.log('Admin already exists.');
      process.exit();
    }

    const admin = new Admin({
      fullName: 'Super Admin',
      email: 'admin@gramathuboutique.com',
      password: 'Admin@123',
      role: 'Super Admin',
      status: true
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();