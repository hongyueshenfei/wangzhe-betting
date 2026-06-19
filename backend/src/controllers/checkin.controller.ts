import { Response, NextFunction } from 'express';
import { checkinService } from '../services/checkin.service';
import { AppError } from '../services/auth.service';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../types/index';

class CheckinController {
  /** POST /api/checkin */
  async checkin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await checkinService.checkin(req.user!.userId);
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

export const checkinController = new CheckinController();
