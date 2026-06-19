import { Request, Response, NextFunction } from 'express';
import { teamsService } from '../services/teams.service';
import { AppError } from '../services/auth.service';
import { success, error, paginated } from '../utils/response';
import type { AuthRequest } from '../types/index';

class TeamsController {
  /** GET /api/teams */
  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId, keyword, page, limit } = req.query;
      const result = await teamsService.getTeamList({
        seasonId: seasonId ? parseInt(seasonId as string, 10) : undefined,
        keyword: keyword as string | undefined,
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

  /** GET /api/teams/:id */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的战队 ID', 400);
        return;
      }
      const result = await teamsService.getTeamById(id);
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** POST /api/teams */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, seasonId, posterUrl, memberPositions } = req.body;
      if (!name) {
        error(res, '战队名称不能为空', 400);
        return;
      }
      const logoUrl = req.body.logoUrl || undefined;

      // Serialize memberPositions to JSON string for members field
      const members = memberPositions
        ? JSON.stringify(memberPositions)
        : req.body.members || undefined;

      const result = await teamsService.createTeam(
        {
          name,
          description,
          members,
          seasonId: seasonId ? Number(seasonId) : undefined,
          posterUrl: posterUrl || undefined,
        },
        logoUrl,
      );
      success(res, result, 201);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** PUT /api/teams/:id */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的战队 ID', 400);
        return;
      }
      const { name, description, logoUrl, posterUrl, memberPositions } = req.body;

      // Serialize memberPositions to JSON string for members field
      const members = memberPositions
        ? JSON.stringify(memberPositions)
        : req.body.members || undefined;

      const result = await teamsService.updateTeam(
        id,
        {
          name,
          description,
          members,
          posterUrl: posterUrl || undefined,
        },
        logoUrl,
      );
      success(res, result);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }

  /** DELETE /api/teams/:id */
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        error(res, '无效的战队 ID', 400);
        return;
      }
      await teamsService.deleteTeam(id);
      success(res, null, 200);
    } catch (err) {
      if (err instanceof AppError) {
        error(res, err.message, err.statusCode);
        return;
      }
      next(err);
    }
  }
}

export const teamsController = new TeamsController();
