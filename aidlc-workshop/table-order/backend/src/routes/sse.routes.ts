import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sseService } from '../services/sse.service';
import { sendError } from '../utils/response';

const router = Router();

// Admin SSE - all orders for the store
// Uses query param ?token= since EventSource doesn't support custom headers
router.get('/orders', (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    sendError(res, 'Token required', 401);
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    if (payload.role !== 'admin') {
      sendError(res, 'Admin access required', 403);
      return;
    }
    sseService.addClient(res, payload.storeId);
  } catch {
    sendError(res, 'Invalid token', 401);
  }
});

// Table SSE - order updates for this table only
router.get('/table', (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    sendError(res, 'Token required', 401);
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    if (payload.role !== 'table') {
      sendError(res, 'Table access required', 403);
      return;
    }
    sseService.addClient(res, payload.storeId, payload.tableId);
  } catch {
    sendError(res, 'Invalid token', 401);
  }
});

export { router as sseRoutes };
