import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error(
      'Hint: create a free cluster at https://www.mongodb.com/cloud/atlas and set MONGO_URI in server/.env'
    );
    process.exit(1);
  }
}
