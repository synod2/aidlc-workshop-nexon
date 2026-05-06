import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, (req, res) => orderController.createOrder(req, res));
router.get('/', authenticate, (req, res) => orderController.getOrders(req, res));
router.get('/:id', authenticate, (req, res) => orderController.getOrderById(req, res));
router.patch('/:id/status', authenticate, requireAdmin, (req, res) => orderController.updateStatus(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => orderController.deleteOrder(req, res));

export { router as orderRoutes };
