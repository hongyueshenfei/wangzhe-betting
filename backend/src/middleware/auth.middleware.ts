import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/index';
import { error } from '../utils/response';

/**
 * Required authentication middleware.
 * Rejects with 401 if no valid JWT token is provided.
 */
export function authRequired(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    error(res, '未登录，请先登录', 401);
    return;
  }

  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    error(res, '登录已过期，请重新登录', 401);
    return;
  }

  req.user = payload;
  next();
}

/**
 * Optional authentication middleware.
 * Attaches user if token is valid, but does NOT reject.
 */
export function authOptional(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);
  const payload = verifyToken(token);
  if (payload) {
    req.user = payload;
  }
  next();
}
