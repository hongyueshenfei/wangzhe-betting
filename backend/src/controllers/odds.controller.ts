import { Request, Response, NextFunction } from 'express';
import { oddsService } from '../services/odds.service';
import { AppError } from '../services/auth.service';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../types/index';

class OddsController {
  /** GET /api/odds/:matchId */
  async getOdds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.params.matchId as string, 10);
      if (isNaN(matchId)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const result = await oddsService.getOdds(matchId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/odds/:matchId */
  async updateOdds(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.params.matchId as string, 10);
      if (isNaN(matchId)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const { oddsA, oddsB } = req.body;
      const result = await oddsService.updateOdds(matchId, oddsA, oddsB);
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

export const oddsController = new OddsController();
