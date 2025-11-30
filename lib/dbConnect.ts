import mongoose from 'mongoose';

const getMongoDBURI = () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }
  return MONGODB_URI;
};

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB with connection caching
 *
 * This function implements connection pooling to prevent multiple
 * connections in serverless environments (Next.js API routes).
 *
 * @returns {Promise<typeof mongoose>} The mongoose instance
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
export const dbConnect = async (): Promise<typeof mongoose> => {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if no promise exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const MONGODB_URI = getMongoDBURI();
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✓ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('✗ Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
};

export default dbConnect; 