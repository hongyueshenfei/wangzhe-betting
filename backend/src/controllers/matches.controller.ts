import { Request, Response, NextFunction } from 'express';
import { matchesService } from '../services/matches.service';
import { AppError } from '../services/auth.service';
import { success, error, paginated } from '../utils/response';
import type { AuthRequest } from '../types/index';

class MatchesController {
  /** GET /api/matches */
  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, stage, status, groupName, page, limit } = req.query;
      const result = await matchesService.getMatchList({
        seasonId: seasonId ? parseInt(seasonId as string, 10) : undefined,
        stage: stage as string | undefined,
        status: status as string | undefined,
        groupName: groupName as string | undefined,
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

  /** GET /api/matches/:id */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const result = await matchesService.getMatchById(id, req.user?.userId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/matches/generate */
  async generateMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, groups } = req.body;
      if (!seasonId) {
        error(res, '赛季 ID 不能为空', 400);
        return;
      }
      const result = await matchesService.generateMatches({ seasonId, groups });
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/matches/generate-knockout */
  async generateKnockoutMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId } = req.body;
      if (!seasonId) {
        error(res, '赛季 ID 不能为空', 400);
        return;
      }
      const result = await matchesService.generateKnockoutMatches(seasonId);
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/matches/:id */
  async updateResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.params.id as string, 10);
      if (isNaN(matchId)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const { teamAScore, teamBScore } = req.body;
      if (teamAScore === undefined || teamBScore === undefined) {
        error(res, '双方比分不能为空', 400);
        return;
      }
      const result = await matchesService.updateMatchResult(matchId, { teamAScore, teamBScore });
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/matches/:id/forfeit */
  async forfeitMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.params.id as string, 10);
      if (isNaN(matchId)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const { forfeitTeamId } = req.body;
      if (!forfeitTeamId) {
        error(res, '弃赛战队 ID 不能为空', 400);
        return;
      }
      const result = await matchesService.forfeitMatch(matchId, forfeitTeamId);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PATCH /api/matches/:id/time */
  async updateMatchTime(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.params.id as string, 10);
      if (isNaN(matchId)) {
        error(res, '无效的比赛 ID', 400);
        return;
      }
      const { matchTime } = req.body;
      if (!matchTime) {
        error(res, '比赛时间不能为空', 400);
        return;
      }
      const result = await matchesService.updateMatchTime(matchId, new Date(matchTime));
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

export const matchesController = new MatchesController();
