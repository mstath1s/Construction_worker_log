import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction-log';
console.log(MONGODB_URI);
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Simple connection function without caching
async function dbConnect() {
  // If already connected, return the existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // Connect to MongoDB
  return await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
}

export default dbConnect; 