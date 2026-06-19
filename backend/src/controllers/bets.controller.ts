import { Request, Response, NextFunction } from 'express';
import { betsService } from '../services/bets.service';
import { AppError } from '../services/auth.service';
import { success, error, paginated } from '../utils/response';
import type { AuthRequest } from '../types/index';

class BetsController {
  /** POST /api/bets */
  async placeBet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matchId, teamId, amount } = req.body;
      if (!matchId || !teamId || !amount) {
        error(res, '比赛 ID、战队 ID 和投注金额不能为空', 400);
        return;
      }
      const result = await betsService.placeBet(req.user!.userId, { matchId, teamId, amount });
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/bets/mine */
  async getMyBets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, seasonId, page, limit } = req.query;
      const result = await betsService.getMyBets(req.user!.userId, {
        status: status as string | undefined,
        seasonId: seasonId ? parseInt(seasonId as string, 10) : undefined,
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

  /** POST /api/bets/champion */
  async placeChampionBet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, teamId, amount } = req.body;
      if (!seasonId || !teamId || !amount) {
        error(res, '赛季 ID、战队 ID 和投注金额不能为空', 400);
        return;
      }
      const result = await betsService.placeChampionBet(req.user!.userId, {
        seasonId,
        teamId,
        amount,
      });
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/bets/champion/mine */
  async getMyChampionBets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await betsService.getMyChampionBets(req.user!.userId, {
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

  /** GET /api/bets/champion/pool/:seasonId */
  async getChampionPoolStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seasonId = parseInt(req.params.seasonId as string, 10);
      if (!seasonId) {
        error(res, '赛季 ID 无效', 400);
        return;
      }
      const result = await betsService.getChampionPoolStats(seasonId);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const betsController = new BetsController();
