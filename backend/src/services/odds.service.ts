import { AppError } from './auth.service';
import { MIN_ODDS, MAX_ODDS, PLATFORM_FEE, BASE_BET } from '../utils/constants';
import { prisma } from '../utils/prisma';

export class OddsService {
  async getOdds(matchId: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        oddsA: true,
        oddsB: true,
        betTotalA: true,
        betTotalB: true,
        betCountA: true,
        betCountB: true,
      },
    });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }
    return match;
  }

  async updateOdds(matchId: number, oddsA?: number, oddsB?: number) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }

    const data: Record<string, number> = {};
    if (oddsA !== undefined) {
      if (oddsA < MIN_ODDS || oddsA > MAX_ODDS) {
        throw new AppError(`赔率范围需在 ${MIN_ODDS}-${MAX_ODDS} 之间`, 400);
      }
      data.oddsA = oddsA;
    }
    if (oddsB !== undefined) {
      if (oddsB < MIN_ODDS || oddsB > MAX_ODDS) {
        throw new AppError(`赔率范围需在 ${MIN_ODDS}-${MAX_ODDS} 之间`, 400);
      }
      data.oddsB = oddsB;
    }

    return prisma.match.update({
      where: { id: matchId },
      data,
      select: { id: true, oddsA: true, oddsB: true },
    });
  }

  async recalculateOdds(matchId: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { betTotalA: true, betTotalB: true },
    });
    if (!match) return;

    const adjustedPool = match.betTotalA + match.betTotalB + BASE_BET * 2;

    const oddsA = this.clamp(
      (adjustedPool / (match.betTotalA + BASE_BET)) * PLATFORM_FEE,
      MIN_ODDS,
      MAX_ODDS,
    );
    const oddsB = this.clamp(
      (adjustedPool / (match.betTotalB + BASE_BET)) * PLATFORM_FEE,
      MIN_ODDS,
      MAX_ODDS,
    );

    const roundedOddsA = Math.round(oddsA * 100) / 100;
    const roundedOddsB = Math.round(oddsB * 100) / 100;

    return prisma.match.update({
      where: { id: matchId },
      data: { oddsA: roundedOddsA, oddsB: roundedOddsB },
      select: { id: true, oddsA: true, oddsB: true },
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export const oddsService = new OddsService();
