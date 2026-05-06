import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/response';
import { OrderStatus } from '../models/types';

export class OrderController {
  createOrder(req: Request, res: Response): void {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      let storeId: string;
      let tableId: number;

      if (user.role === 'table') {
        storeId = user.storeId;
        tableId = user.tableId;
      } else {
        // Admin can also create orders (for testing)
        storeId = user.storeId;
        tableId = req.body.tableId;
        if (!tableId) {
          sendError(res, 'tableId is required', 400);
          return;
        }
      }

      const order = orderService.createOrder({
        storeId,
        tableId,
        items: req.body.items,
      });
      sendSuccess(res, order, 201);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  getOrders(req: Request, res: Response): void {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const storeId = user.storeId;
      const sessionId = req.query.sessionId as string | undefined;
      const tableId = req.query.tableId ? Number(req.query.tableId) : undefined;

      const orders = orderService.getOrders(storeId, sessionId, tableId);
      sendSuccess(res, orders);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  getOrderById(req: Request, res: Response): void {
    try {
      const orderId = Number(req.params.id);
      const order = orderService.getOrderById(orderId);
      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }
      sendSuccess(res, order);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  updateStatus(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const orderId = Number(req.params.id);
      const { status } = req.body as { status: OrderStatus };

      if (!['pending', 'preparing', 'completed'].includes(status)) {
        sendError(res, 'Invalid status. Must be pending, preparing, or completed', 400);
        return;
      }

      const order = orderService.updateOrderStatus(orderId, status, storeId);
      sendSuccess(res, order);
    } catch (err: any) {
      if (err.message === 'Order not found') {
        sendError(res, err.message, 404);
      } else if (err.message.includes('Cannot transition')) {
        sendError(res, err.message, 400);
      } else {
        sendError(res, err.message);
      }
    }
  }

  deleteOrder(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const orderId = Number(req.params.id);
      orderService.deleteOrder(orderId, storeId);
      res.status(204).send();
    } catch (err: any) {
      if (err.message === 'Order not found') {
        sendError(res, err.message, 404);
      } else {
        sendError(res, err.message);
      }
    }
  }
}

export const orderController = new OrderController();
