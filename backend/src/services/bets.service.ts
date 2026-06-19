import { PrismaClient, MatchStatus, BetStatus } from '@prisma/client';
import { AppError } from './auth.service';
import { MIN_BET_AMOUNT } from '../utils/constants';
import type { PlaceBetDTO, PlaceChampionBetDTO } from '../types/index';

const prisma = new PrismaClient();

export class BetsService {
  /**
   * Place a bet on a match.
   * - Validates match status, user balance, no duplicate bet
   * - Locks odds at time of bet
   * - Updates match bet totals and recalculates odds
   */
  async placeBet(userId: number, dto: PlaceBetDTO) {
    // Validate amount
    if (dto.amount < MIN_BET_AMOUNT) {
      throw new AppError(`最低投注金额为 ${MIN_BET_AMOUNT} 币`, 400);
    }

    const [user, match] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.match.findUnique({
        where: { id: dto.matchId },
        include: {
          teamA: true,
          teamB: true,
        },
      }),
    ]);

    if (!user) throw new AppError('用户不存在', 404);
    if (user.isBanned) throw new AppError('账号已被封禁', 403);
    if (!match) throw new AppError('比赛不存在', 404);

    // Match must be UPCOMING or LIVE
    if (match.status !== MatchStatus.UPCOMING && match.status !== MatchStatus.LIVE) {
      throw new AppError('比赛已开始或已结束，无法投注', 400);
    }

    // Validate team belongs to this match
    if (dto.teamId !== match.teamAId && dto.teamId !== match.teamBId) {
      throw new AppError('该战队不在此比赛中', 400);
    }

    // Check sufficient balance
    if (user.coins < dto.amount) {
      throw new AppError('投注币余额不足', 400);
    }

    // Determine which side (A or B) and get current odds
    const isBetOnA = dto.teamId === match.teamAId;
    const oddsAtBet = isBetOnA ? match.oddsA : match.oddsB;

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check for duplicate (unique constraint will also catch this)
      const existing = await tx.bet.findUnique({
        where: { userId_matchId: { userId, matchId: dto.matchId } },
      });
      if (existing) {
        throw new AppError('您已对此比赛投注过', 400);
      }

      // Create bet
      const bet = await tx.bet.create({
        data: {
          userId,
          matchId: dto.matchId,
          pickedTeamId: dto.teamId,
          amount: dto.amount,
          oddsAtBet,
          status: BetStatus.PENDING,
        },
      });

      // Deduct coins
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: dto.amount } },
      });

      // Record transaction
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -dto.amount,
          type: 'BET',
          referenceType: 'bet',
          referenceId: bet.id,
          balanceAfter: updatedUser.coins,
        },
      });

      // Update match bet totals
      if (isBetOnA) {
        await tx.match.update({
          where: { id: dto.matchId },
          data: {
            betTotalA: { increment: dto.amount },
            betCountA: { increment: 1 },
          },
        });
      } else {
        await tx.match.update({
          where: { id: dto.matchId },
          data: {
            betTotalB: { increment: dto.amount },
            betCountB: { increment: 1 },
          },
        });
      }

      return { bet, newBalance: updatedUser.coins };
    });

    // Recalculate odds after bet (outside transaction)
    const { oddsService } = await import('./odds.service');
    await oddsService.recalculateOdds(dto.matchId);

    return result;
  }

  /**
   * Get current user's bet history.
   */
  async getMyBets(userId: number, params: { status?: string; seasonId?: number; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (params.status) where.status = params.status;
    if (params.seasonId) {
      where.match = { seasonId: params.seasonId };
    }

    const [list, total] = await Promise.all([
      prisma.bet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          match: {
            include: {
              teamA: { select: { id: true, name: true, logoUrl: true } },
              teamB: { select: { id: true, name: true, logoUrl: true } },
              season: { select: { id: true, name: true } },
            },
          },
          pickedTeam: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      prisma.bet.count({ where }),
    ]);

    return { list, total, page, limit };
  }

  /**
   * Place a champion bet on a season.
   */
  async placeChampionBet(userId: number, dto: PlaceChampionBetDTO) {
    if (dto.amount < MIN_BET_AMOUNT) {
      throw new AppError(`最低投注金额为 ${MIN_BET_AMOUNT} 币`, 400);
    }

    const [user, season, team] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.season.findUnique({ where: { id: dto.seasonId } }),
      prisma.team.findFirst({ where: { id: dto.teamId, seasonId: dto.seasonId } }),
    ]);

    if (!user) throw new AppError('用户不存在', 404);
    if (user.isBanned) throw new AppError('账号已被封禁', 403);
    if (!season) throw new AppError('赛季不存在', 404);
    if (!team) throw new AppError('该战队不属于此赛季', 400);

    if (season.status !== 'UPCOMING' && season.status !== 'ACTIVE') {
      throw new AppError('赛季已结束，无法进行冠军投注', 400);
    }

    // Check deadline: first match must not have started
    const isOpen = await this.isChampionBettingOpen(dto.seasonId);
    if (!isOpen) {
      throw new AppError('第一轮比赛已开始，冠军投注已截止', 400);
    }

    if (user.coins < dto.amount) {
      throw new AppError('投注币余额不足', 400);
    }

    // Champion bet uses pool model — no odds
    const oddsAtBet = 0;

    const result = await prisma.$transaction(async (tx) => {
      // Check duplicate (one champion bet per team per season — can bet on multiple teams)
      const existing = await tx.championBet.findFirst({
        where: { userId, seasonId: dto.seasonId, teamId: dto.teamId },
      });
      if (existing) {
        throw new AppError('您已对此战队进行过冠军投注', 400);
      }

      const bet = await tx.championBet.create({
        data: {
          userId,
          seasonId: dto.seasonId,
          teamId: dto.teamId,
          amount: dto.amount,
          oddsAtBet,
          status: BetStatus.PENDING,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: dto.amount } },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -dto.amount,
          type: 'CHAMPION_BET',
          referenceType: 'champion_bet',
          referenceId: bet.id,
          balanceAfter: updatedUser.coins,
        },
      });

      return { bet, newBalance: updatedUser.coins };
    });

    return result;
  }

  /**
   * Get current user's champion bet history.
   */
  async getMyChampionBets(userId: number, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      prisma.championBet.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          season: { select: { id: true, name: true, status: true } },
          team: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      prisma.championBet.count({ where: { userId } }),
    ]);

    return { list, total, page, limit };
  }

  /**
   * Get champion bet pool stats for a season.
   */
  async getChampionPoolStats(seasonId: number) {
    const [bets, firstMatch] = await Promise.all([
      prisma.championBet.findMany({
        where: { seasonId, status: 'PENDING' },
        select: { amount: true },
      }),
      prisma.match.findFirst({
        where: { seasonId },
        orderBy: { matchTime: 'asc' },
        select: { matchTime: true },
      }),
    ]);

    const totalPool = bets.reduce((sum, b) => sum + b.amount, 0);

    return {
      totalPool,
      betCount: bets.length,
      deadline: firstMatch?.matchTime || null,
    };
  }

  /**
   * Check if champion betting is still open for a season.
   * Returns false if the first match has already started.
   */
  async isChampionBettingOpen(seasonId: number): Promise<boolean> {
    const firstMatch = await prisma.match.findFirst({
      where: { seasonId },
      orderBy: { matchTime: 'asc' },
      select: { matchTime: true },
    });
    if (!firstMatch) return true; // No matches yet = still open
    return new Date() < firstMatch.matchTime;
  }
}

export const betsService = new BetsService();
