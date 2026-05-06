import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { menuRoutes } from './routes/menu.routes';
import { orderRoutes } from './routes/order.routes';
import { tableRoutes } from './routes/table.routes';
import { sseRoutes } from './routes/sse.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sse', sseRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
