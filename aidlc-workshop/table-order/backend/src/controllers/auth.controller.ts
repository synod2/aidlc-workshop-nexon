import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  register(req: Request, res: Response): void {
    try {
      const { storeId, username, password } = req.body;
      const result = authService.registerAdmin({ storeId, username, password });
      sendSuccess(res, result, 201);
    } catch (err: any) {
      if (err.message === 'Username already exists in this store') {
        sendError(res, err.message, 409);
      } else {
        sendError(res, err.message, 400);
      }
    }
  }

  login(req: Request, res: Response): void {
    try {
      const { storeId, username, password } = req.body;
      const result = authService.loginAdmin({ storeId, username, password });
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message.includes('locked')) {
        sendError(res, err.message, 429);
      } else {
        sendError(res, err.message, 401);
      }
    }
  }

  tableLogin(req: Request, res: Response): void {
    try {
      const { storeId, tableNumber, password } = req.body;
      const result = authService.loginTable({ storeId, tableNumber, password });
      sendSuccess(res, result);
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  }
}

export const authController = new AuthController();
