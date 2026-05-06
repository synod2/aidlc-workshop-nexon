import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public (authenticated - table or admin)
router.get('/', authenticate, (req, res) => menuController.getMenus(req, res));
router.get('/categories', authenticate, (req, res) => menuController.getCategories(req, res));
router.get('/:id', authenticate, (req, res) => menuController.getMenuById(req, res));

// Admin only
router.post('/', authenticate, requireAdmin, (req, res) => menuController.createMenu(req, res));
router.put('/:id', authenticate, requireAdmin, (req, res) => menuController.updateMenu(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => menuController.deleteMenu(req, res));
router.post('/categories', authenticate, requireAdmin, (req, res) => menuController.createCategory(req, res));

export { router as menuRoutes };
