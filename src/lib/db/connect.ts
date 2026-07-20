import dns from "node:dns/promises";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in environment");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Cached | undefined;
}

const cached: Cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
