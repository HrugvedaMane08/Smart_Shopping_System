import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import productRoutes from './routes/product.routes.js';

import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;