import { Request, Response, NextFunction } from 'express';
import { authService, AppError } from '../services/auth.service';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../types/index';

class AuthController {
  /** POST /api/auth/register */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        error(res, '用户名和密码不能为空', 400);
        return;
      }
      const result = await authService.register({ username, password });
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/auth/login */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        error(res, '用户名和密码不能为空', 400);
        return;
      }
      const result = await authService.login({ username, password });
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/auth/me */
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.getMe(req.user!.userId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }
}

export const authController = new AuthController();
