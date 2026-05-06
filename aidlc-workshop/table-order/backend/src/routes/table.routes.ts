import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, requireAdmin, (req, res) => tableController.getTables(req, res));
router.post('/', authenticate, requireAdmin, (req, res) => tableController.createTable(req, res));
router.post('/:id/complete', authenticate, requireAdmin, (req, res) => tableController.completeSession(req, res));
router.get('/:id/history', authenticate, requireAdmin, (req, res) => tableController.getHistory(req, res));

export { router as tableRoutes };
