import { Request, Response } from 'express';
import { tableService } from '../services/table.service';
import { sseService } from '../services/sse.service';
import { sendSuccess, sendError } from '../utils/response';

export class TableController {
  createTable(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const table = tableService.createTable({ ...req.body, storeId });
      sendSuccess(res, table, 201);
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        sendError(res, err.message, 409);
      } else {
        sendError(res, err.message);
      }
    }
  }

  getTables(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const tables = tableService.getTables(storeId);
      sendSuccess(res, tables);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  completeSession(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const tableId = Number(req.params.id);
      const result = tableService.completeSession(tableId, storeId);
      sendSuccess(res, { message: 'Session completed', ...result });
    } catch (err: any) {
      if (err.message.includes('No active session')) {
        sendError(res, err.message, 400);
      } else {
        sendError(res, err.message);
      }
    }
  }

  getHistory(req: Request, res: Response): void {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const tableId = Number(req.params.id);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const history = tableService.getOrderHistory(tableId, storeId, startDate, endDate);
      sendSuccess(res, history);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  tableRequest(req: Request, res: Response): void {
    try {
      const user = req.user;
      if (!user || user.role !== 'table') {
        sendError(res, 'Table access required', 403);
        return;
      }

      const { requestType, message } = req.body;
      if (!requestType) {
        sendError(res, 'requestType is required', 400);
        return;
      }

      sseService.broadcastTableRequest(user.storeId, {
        tableId: user.tableId,
        tableNumber: user.tableNumber,
        requestType,
        message: message || '',
      });

      sendSuccess(res, { message: 'Request sent' });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
}

export const tableController = new TableController();
