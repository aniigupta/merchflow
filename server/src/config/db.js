import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGO_URI from environment variables.
 * Exits the process on failure so the server never starts in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
