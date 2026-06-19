import { Response } from 'express';
import { ApiResponse } from '../types/index';

/**
 * Send a success response (code=0).
 */
export function success<T>(res: Response, data?: T, statusCode: number = 200): void {
  const body: ApiResponse<T> = { code: 0 };
  if (data !== undefined) {
    body.data = data;
  }
  res.status(statusCode).json(body);
}

/**
 * Send an error response (code=1).
 */
export function error(
  res: Response,
  message: string,
  statusCode: number = 400,
): void {
  const body: ApiResponse = { code: 1, message };
  res.status(statusCode).json(body);
}

/**
 * Send a paginated list response.
 */
export function paginated<T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  limit: number,
): void {
  success(res, { list, total, page, limit });
}
