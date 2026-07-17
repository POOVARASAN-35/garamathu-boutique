import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gramathu-boutique';

async function resetAdminPassword() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('Connected.');

    // Find and update or create admin
    let adminUser = await User.findOne({ email: 'admin@gramathuboutique.com' });
    if (adminUser) {
      console.log('Admin found, updating password to plain text admin123...');
      adminUser.password = 'admin123'; // Mongoose pre-save hook will hash this correctly
      await adminUser.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Admin not found, creating new admin with password admin123...');
      adminUser = new User({
        firstName: "Admin",
        lastName: "Gramathu",
        email: "admin@gramathuboutique.com",
        password: "admin123", // Hashes on save
        role: "admin",
        addresses: [],
        wishlist: []
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

resetAdminPassword();
