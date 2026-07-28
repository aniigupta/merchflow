import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGO_URI from environment variables.
 * Exits the process on failure so the server never starts in a broken state.
 */
const connectDB = async () => {
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error(`❌ MongoDB connection error: Neither MONGO_URI nor MONGODB_URI is defined in your environment variables.`);
    process.exit(1);
  }

  // Clean connection string: trim whitespace and remove accidental enclosing quotes
  uri = uri.trim().replace(/^["']|["']$/g, '');

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
