import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

export const connectDB = async () => {
  try {
    // Override DNS servers to use Google and Cloudflare to bypass ISP blocks on SRV records
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
