import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from './src/middleware/auth.js';

import userRoutes from './src/routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Trust proxy if we are behind a reverse proxy (e.g., Nginx, Heroku, etc.)
// Needed for correct IP tracking in rate limit and database
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api', apiLimiter);

// Public health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Protect all /api routes below this
app.use('/api', authenticateToken);

// Mount routes
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
