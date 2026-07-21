import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './src/middleware/auth.js';

import userRoutes from './src/routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Public health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Protect all /api routes below this
app.use('/api', authenticateToken);

// Mount routes
app.use('/api/users', userRoutes);

app.listen(() => {
  console.log(`Auth service running on port ${PORT}`);
});
