import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { TokenPayload } from '../models/types';
import { sendError } from '../utils/response';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    sendError(res, 'Admin access required', 403);
    return;
  }
  next();
}

export function requireTable(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'table') {
    sendError(res, 'Table access required', 403);
    return;
  }
  next();
}
