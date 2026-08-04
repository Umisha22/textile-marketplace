import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { PORT, CLIENT_ORIGIN } from './config/env.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import supplierRoutes from './routes/supplier.js';
import aiRoutes from './routes/ai.js';
import recommendationRoutes from './routes/recommendations.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Serve built client in production.
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => (err ? next() : null));
});

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API ready at http://localhost:${PORT}`));
});
