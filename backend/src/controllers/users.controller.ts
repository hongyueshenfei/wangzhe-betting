import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { AppError } from '../services/auth.service';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../types/index';

class UsersController {
  /** GET /api/users/me */
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.getMyProfile(req.user!.userId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/users/me */
  async updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;
      const result = await usersService.updateMyProfile(req.user!.userId, { password });
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/users/:id */
  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的用户 ID', 400);
        return;
      }
      const result = await usersService.getUserById(id);
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

export const usersController = new UsersController();
