import { Request, Response } from 'express';
import { menuService } from '../services/menu.service';
import { sendSuccess, sendError } from '../utils/response';

export class MenuController {
  getCategories(req: Request, res: Response): void {
    try {
      const storeId = req.query.storeId as string || req.user?.storeId;
      if (!storeId) {
        sendError(res, 'storeId is required', 400);
        return;
      }
      const categories = menuService.getCategories(storeId);
      sendSuccess(res, categories);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  createCategory(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const category = menuService.createCategory({ ...req.body, storeId });
      sendSuccess(res, category, 201);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  getMenus(req: Request, res: Response): void {
    try {
      const storeId = req.query.storeId as string || req.user?.storeId;
      if (!storeId) {
        sendError(res, 'storeId is required', 400);
        return;
      }
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const includeUnavailable = req.user?.role === 'admin';
      const menus = menuService.getMenus(storeId, categoryId, includeUnavailable);
      sendSuccess(res, menus);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  getMenuById(req: Request, res: Response): void {
    try {
      const menuId = Number(req.params.id);
      const menu = menuService.getMenuById(menuId);
      if (!menu) {
        sendError(res, 'Menu item not found', 404);
        return;
      }
      sendSuccess(res, menu);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  createMenu(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const menu = menuService.createMenu({ ...req.body, storeId });
      sendSuccess(res, menu, 201);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  updateMenu(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const menuId = Number(req.params.id);
      const menu = menuService.updateMenu(menuId, storeId, req.body);
      sendSuccess(res, menu);
    } catch (err: any) {
      if (err.message === 'Menu item not found') {
        sendError(res, err.message, 404);
      } else {
        sendError(res, err.message);
      }
    }
  }

  deleteMenu(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const menuId = Number(req.params.id);
      menuService.deleteMenu(menuId, storeId);
      sendSuccess(res, null, 204);
    } catch (err: any) {
      if (err.message === 'Menu item not found') {
        sendError(res, err.message, 404);
      } else {
        sendError(res, err.message);
      }
    }
  }
}

export const menuController = new MenuController();
