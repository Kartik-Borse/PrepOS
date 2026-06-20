import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import aiRouter from './routes/ai';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import leetcodeRouter from './routes/leetcode';
import problemsRouter from './routes/problems';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/leetcode', leetcodeRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/users', usersRouter);
app.use('/health', healthRouter);

// Start server only when run directly (not when imported by Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
}

// Default export for Vercel serverless (api/index.ts imports this)
export default app;
