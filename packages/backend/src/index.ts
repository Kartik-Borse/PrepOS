import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import codeRunnerRouter from './routes/codeRunner';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple rate limiter: max 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/code', limiter);

app.use('/api/code', codeRunnerRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
