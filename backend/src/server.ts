import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

let isConnected = false;

// Middleware to ensure DB connection for Vercel serverless functions
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

export default app;
