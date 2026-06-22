import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index';
import { error } from '../utils/response';

/**
 * Admin-only middleware. Must be used AFTER authRequired.
 * Rejects with 403 if user role is not ADMIN.
 */
export function adminOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    error(res, '无权限，仅管理员可操作', 403);
    return;
  }
  next();
}
