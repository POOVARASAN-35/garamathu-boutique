import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gramathu-boutique';

async function checkAndSeedAdmin() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    const adminUser = await User.findOne({ email: 'admin@gramathuboutique.com' });
    if (adminUser) {
      console.log('Admin user already exists:');
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- Role: ${adminUser.role}`);
    } else {
      console.log('Admin user does not exist. Creating admin user...');
      const newAdmin = new User({
        firstName: "Admin",
        lastName: "Gramathu",
        email: "admin@gramathuboutique.com",
        password: "$2a$10$/7ISTPsOH2ljJlz4rC0/bOwyOQbHspIbN3IhC79Cux58vUwByO5ue", // admin123
        role: "admin",
        addresses: [],
        wishlist: []
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error checking/seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

checkAndSeedAdmin();
