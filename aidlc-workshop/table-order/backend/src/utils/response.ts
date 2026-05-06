import { Response } from 'express';
import { ApiResponse } from '../models/types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse = {
    success: false,
    error,
  };
  res.status(statusCode).json(response);
}
