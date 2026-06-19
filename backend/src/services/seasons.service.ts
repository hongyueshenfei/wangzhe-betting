import { PrismaClient, SeasonStatus } from '@prisma/client';
import { AppError } from './auth.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';
import type { CreateSeasonDTO, UpdateSeasonDTO } from '../types/index';

const prisma = new PrismaClient();

export class SeasonsService {
  /**
   * Get paginated season list, optionally filtered by status.
   */
  async getSeasonList(params: { status?: string; page?: number; limit?: number }) {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.status) {
      where.status = params.status;
    }

    const [list, total] = await Promise.all([
      prisma.season.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          championTeam: { select: { id: true, name: true, logoUrl: true } },
          _count: { select: { teams: true, matches: true } },
        },
      }),
      prisma.season.count({ where }),
    ]);

    // Parse tournamentConfig JSON string for each season
    const parsed = list.map(s => ({
      ...s,
      tournamentConfig: s.tournamentConfig ? JSON.parse(s.tournamentConfig) : null,
    }));

    return { list: parsed, total, page, limit };
  }

  /**
   * Get season detail by ID, including teams.
   */
  async getSeasonById(id: number) {
    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        championTeam: { select: { id: true, name: true, logoUrl: true } },
        teams: true,
        _count: { select: { matches: true } },
      },
    });
    if (!season) {
      throw new AppError('赛季不存在', 404);
    }
    return season;
  }

  /**
   * Create a new season (admin).
   */
  async createSeason(dto: CreateSeasonDTO) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new AppError('开始日期必须早于结束日期', 400);
    }

    // Enforce single-season policy
    const existingSeason = await prisma.season.findFirst();
    if (existingSeason) {
      throw new AppError('已存在赛季，请先结束当前赛季再创建新赛季', 400);
    }

    return prisma.season.create({
      data: {
        name: dto.name,
        startDate,
        endDate,
        status: SeasonStatus.UPCOMING,
        tournamentConfig: dto.config ? JSON.stringify(dto.config) : null,
      },
    });
  }

  /**
   * Update a season (admin).
   */
  async updateSeason(id: number, dto: UpdateSeasonDTO) {
    const season = await prisma.season.findUnique({ where: { id } });
    if (!season) {
      throw new AppError('赛季不存在', 404);
    }

    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.status) data.status = dto.status;
    if (dto.config) data.tournamentConfig = JSON.stringify(dto.config);

    return prisma.season.update({ where: { id }, data });
  }

  /**
   * Set champion team for a season (admin).
   * Triggers settlement of all champion bets for this season.
   */
  async setChampion(seasonId: number, championTeamId: number) {
    const season = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) {
      throw new AppError('赛季不存在', 404);
    }

    const team = await prisma.team.findFirst({
      where: { id: championTeamId, seasonId },
    });
    if (!team) {
      throw new AppError('该战队不属于此赛季', 400);
    }

    // Update season with champion and mark as COMPLETED
    const updated = await prisma.season.update({
      where: { id: seasonId },
      data: {
        championTeamId,
        status: SeasonStatus.COMPLETED,
      },
      include: {
        championTeam: { select: { id: true, name: true } },
      },
    });

    // Settle champion bets
    const { settlementService } = await import('./settlement.service');
    const settleResult = await settlementService.settleChampionBets(
      seasonId,
      championTeamId,
    );

    return { season: updated, settlement: settleResult };
  }
}

export const seasonsService = new SeasonsService();
