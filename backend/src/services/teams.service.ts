import { PrismaClient } from '@prisma/client';
import { AppError } from './auth.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';
import type { CreateTeamDTO, UpdateTeamDTO } from '../types/index';

const prisma = new PrismaClient();

export class TeamsService {
  /**
   * Get paginated team list with optional filters.
   */
  async getTeamList(params: {
    seasonId?: number;
    keyword?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.seasonId) {
      where.seasonId = params.seasonId;
    }
    if (params.keyword) {
      where.name = { contains: params.keyword };
    }

    const [list, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          season: { select: { id: true, name: true } },
        },
      }),
      prisma.team.count({ where }),
    ]);

    return { list, total, page, limit };
  }

  /**
   * Get team detail by ID with stats.
   */
  async getTeamById(id: number) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        season: { select: { id: true, name: true, status: true } },
        matchesAsA: {
          where: { status: { not: 'UPCOMING' } },
          include: { teamB: { select: { id: true, name: true } } },
          orderBy: { matchTime: 'desc' },
          take: 10,
        },
        matchesAsB: {
          where: { status: { not: 'UPCOMING' } },
          include: { teamA: { select: { id: true, name: true } } },
          orderBy: { matchTime: 'desc' },
          take: 10,
        },
      },
    });
    if (!team) {
      throw new AppError('战队不存在', 404);
    }

    // Merge and sort all recent matches
    const recentMatches = [
      ...team.matchesAsA.map((m) => ({
        ...m,
        opponent: m.teamB,
        isTeamA: true,
      })),
      ...team.matchesAsB.map((m) => ({
        ...m,
        opponent: m.teamA,
        isTeamA: false,
      })),
    ]
      .sort((a, b) => b.matchTime.getTime() - a.matchTime.getTime())
      .slice(0, 10);

    const { matchesAsA, matchesAsB, ...teamData } = team;
    return { ...teamData, recentMatches };
  }

  /**
   * Create a new team (admin).
   * seasonId is optional now — teams don't have to belong to a season.
   * memberPositions are serialized as JSON string stored in members field.
   */
  async createTeam(dto: CreateTeamDTO, logoUrl?: string) {
    // Verify season exists only if seasonId is provided
    if (dto.seasonId) {
      const season = await prisma.season.findUnique({ where: { id: dto.seasonId } });
      if (!season) {
        throw new AppError('赛季不存在', 404);
      }
    }

    return prisma.team.create({
      data: {
        name: dto.name,
        logoUrl: logoUrl || null,
        description: dto.description || null,
        members: dto.members || null,
        posterUrl: dto.posterUrl || null,
        seasonId: dto.seasonId || null,
        color: dto.color || null,
        abbr: dto.abbr || null,
      },
    });
  }

  /**
   * Update a team (admin).
   * Supports updating posterUrl in addition to existing fields.
   */
  async updateTeam(id: number, dto: UpdateTeamDTO, logoUrl?: string) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new AppError('战队不存在', 404);
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.members !== undefined) data.members = dto.members;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (dto.posterUrl !== undefined) data.posterUrl = dto.posterUrl;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.abbr !== undefined) data.abbr = dto.abbr;

    return prisma.team.update({ where: { id }, data });
  }

  /**
   * Delete a team (admin). Only allowed if no matches reference it.
   */
  async deleteTeam(id: number) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new AppError('战队不存在', 404);
    }

    // Check for related matches
    const relatedMatches = await prisma.match.count({
      where: {
        OR: [{ teamAId: id }, { teamBId: id }],
      },
    });
    if (relatedMatches > 0) {
      throw new AppError('该战队已有比赛记录，无法删除', 400);
    }

    return prisma.team.delete({ where: { id } });
  }
}

export const teamsService = new TeamsService();
