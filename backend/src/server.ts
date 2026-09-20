import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

let isConnected = false;

if (process.env.NODE_ENV !== 'production') {
  // Local development
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  });
}

// Vercel Serverless Function wrapper
export default async function(req: any, res: any) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
