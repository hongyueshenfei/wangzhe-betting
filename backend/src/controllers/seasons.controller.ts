import { Request, Response, NextFunction } from 'express';
import { seasonsService } from '../services/seasons.service';
import { AppError } from '../services/auth.service';
import { success, error, paginated } from '../utils/response';
import type { AuthRequest } from '../types/index';

class SeasonsController {
  /** GET /api/seasons */
  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await seasonsService.getSeasonList({
        status: status as string | undefined,
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

  /** GET /api/seasons/:id */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的赛季 ID', 400);
        return;
      }
      const result = await seasonsService.getSeasonById(id);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/seasons */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, startDate, endDate, config } = req.body;
      if (!name || !startDate || !endDate) {
        error(res, '赛季名称、开始日期和结束日期不能为空', 400);
        return;
      }
      const result = await seasonsService.createSeason({ name, startDate, endDate, config });
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/seasons/:id */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的赛季 ID', 400);
        return;
      }
      const { name, startDate, endDate, status, config } = req.body;
      const result = await seasonsService.updateSeason(id, { name, startDate, endDate, status, config });
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/seasons/:id/champion */
  async setChampion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const seasonId = parseInt(req.params.id as string, 10);
      if (isNaN(seasonId)) {
        error(res, '无效的赛季 ID', 400);
        return;
      }
      const { championTeamId } = req.body;
      if (!championTeamId) {
        error(res, '冠军战队 ID 不能为空', 400);
        return;
      }
      const result = await seasonsService.setChampion(seasonId, championTeamId);
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

export const seasonsController = new SeasonsController();
