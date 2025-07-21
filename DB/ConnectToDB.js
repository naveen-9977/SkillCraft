import mongoose from "mongoose";

export default async function ConnectToDB() {
  try {
    mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.MONGODB_DB_NAME,
    });

    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Re-throw the error to handle it in the registration API
  }
}
