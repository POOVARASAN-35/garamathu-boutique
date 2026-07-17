import mongoose from 'mongoose';
import Product from '../models/Product.js';

export const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/gramathu-boutique';
    console.log(`Connecting to MongoDB at: ${connString}...`);
    
    const conn = await mongoose.connect(connString);
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);

    // Auto-migrate legacy boolean/invalid status flags to 'Active'
    try {
      const result = await Product.updateMany(
        { status: { $in: [true, 'true', null, 'Active '] } },
        { $set: { status: 'Active' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Migration] Updated ${result.modifiedCount} legacy product status flags to 'Active'`);
      }
    } catch (migError) {
      console.warn('[Migration] Error migrating product statuses:', migError.message);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
