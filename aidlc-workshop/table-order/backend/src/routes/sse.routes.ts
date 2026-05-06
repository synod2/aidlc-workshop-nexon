import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { sseService } from '../services/sse.service';

const router = Router();

router.get('/orders', authenticate, requireAdmin, (req: Request, res: Response) => {
  const storeId = req.user!.storeId;
  sseService.addClient(res, storeId);
});

export { router as sseRoutes };
