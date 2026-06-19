import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { AppError } from '../services/auth.service';
import { success, error } from '../utils/response';

class LeaderboardController {
  /** GET /api/leaderboard/users */
  async getUserLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, limit } = req.query;
      const result = await leaderboardService.getUserLeaderboard({
        seasonId: seasonId ? parseInt(seasonId as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** GET /api/leaderboard/teams */
  async getTeamLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, limit } = req.query;
      const result = await leaderboardService.getTeamLeaderboard({
        seasonId: seasonId ? parseInt(seasonId as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
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

export const leaderboardController = new LeaderboardController();
