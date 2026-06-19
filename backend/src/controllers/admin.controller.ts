import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { usersService } from '../services/users.service';
import { AppError } from '../services/auth.service';
import { success, error, paginated } from '../utils/response';
import type { AuthRequest } from '../types/index';

class AdminController {
  /** GET /api/admin/dashboard */
  async getDashboard(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getDashboard();
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/admin/users */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword, isBanned, page, limit } = req.query;
      const result = await usersService.getUserList({
        keyword: keyword as string | undefined,
        isBanned: isBanned !== undefined ? isBanned === 'true' : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      paginated(res, result.list, result.total, result.page, result.limit);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/admin/users/:id/ban */
  async banUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        error(res, '无效的用户 ID', 400);
        return;
      }
      const result = await usersService.banUser(userId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/admin/users/:id/unban */
  async unbanUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        error(res, '无效的用户 ID', 400);
        return;
      }
      const result = await usersService.unbanUser(userId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/admin/users/:id/coins */
  async adjustCoins(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        error(res, '无效的用户 ID', 400);
        return;
      }
      const { amount, reason } = req.body;
      if (amount === undefined || amount === null) {
        error(res, '调整金额不能为空', 400);
        return;
      }
      const result = await usersService.adjustCoins(userId, amount, reason);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/admin/users/:id/reset-password */
  async resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        error(res, '无效的用户 ID', 400);
        return;
      }
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        error(res, '新密码至少 6 位', 400);
        return;
      }
      const result = await usersService.resetPassword(userId, newPassword);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/admin/users/batch */
  async batchCreateUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { users } = req.body;
      if (!users || !Array.isArray(users) || users.length === 0) {
        error(res, '请提供用户列表', 400);
        return;
      }
      const result = await usersService.batchCreateUsers(users);
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }
}

export const adminController = new AdminController();
