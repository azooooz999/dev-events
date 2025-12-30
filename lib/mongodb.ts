import mongoose from 'mongoose';

// Define the shape of the cached connection object
interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global type to include our mongoose cache
declare global {
	// eslint-disable-next-line-no-var
	var mongoose: MongooseCache | undefined;
}

// Define the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache on the global object to persist across hot reloads in development
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
	global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections in development (hot reload).
 *
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
	// Return existing connection if available
	if (cached.conn) {
		return cached.conn;
	}

	// Return existing connection promise if one is in progress
	if (!cached.promise) {
		// Validate MongoDB URI exists
		if (!MONGODB_URI) {
			throw new Error(
				'Please define the MONGODB_URI environment variable inside .env.local'
			);
		}
		const opts = {
			bufferCommands: false, // Disable command buffering for better error handling
		};

		// Create new connection promise
		cached.promise = mongoose
			.connect(MONGODB_URI as string, opts)
			.then((mongooseInstance) => {
				return mongooseInstance;
			});
	}

	try {
		// Await the connection and cache it
		cached.conn = await cached.promise;
	} catch (e) {
		// Reset promise on error to allow retry
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default connectDB;
