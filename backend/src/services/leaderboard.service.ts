import { prisma } from '../utils/prisma';

export class LeaderboardService {
  /**
   * Get user leaderboard ranked by total winnings from bets.
   * If seasonId is provided, only counts bets from matches in that season.
   */
  async getUserLeaderboard(params: { seasonId?: number; limit?: number }) {
    const limit = params.limit || 20;

    // We rank users by their current coin balance as a proxy for performance
    const where: Record<string, unknown> = {
      role: 'BETTOR',
      isBanned: false,
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { coins: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        coins: true,
        _count: { select: { bets: true } },
      },
    });

    // Get win/loss counts
    const enriched = await Promise.all(
      users.map(async (user, index) => {
        const [winCount, lossCount] = await Promise.all([
          prisma.bet.count({ where: { userId: user.id, status: 'WON' } }),
          prisma.bet.count({ where: { userId: user.id, status: 'LOST' } }),
        ]);
        const settledBets = winCount + lossCount;
        const winRate = settledBets > 0 ? Math.round((winCount / settledBets) * 100) : 0;

        return {
          rank: index + 1,
          userId: user.id,
          username: user.username,
          coins: user.coins,
          winCount,
          lossCount,
          totalBets: user._count.bets,
          winRate,
        };
      }),
    );

    return { list: enriched, limit };
  }

  /**
   * Get team leaderboard ranked by wins.
   * If seasonId is provided, filter by season.
   */
  async getTeamLeaderboard(params: { seasonId?: number; limit?: number }) {
    const limit = params.limit || 20;

    const where: Record<string, unknown> = {};
    if (params.seasonId) where.seasonId = params.seasonId;

    const teams = await prisma.team.findMany({
      where,
      orderBy: [{ wins: 'desc' }, { losses: 'asc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        wins: true,
        losses: true,
        forfeits: true,
        season: { select: { id: true, name: true } },
      },
    });

    const list = teams.map((team, index) => ({
      rank: index + 1,
      ...team,
    }));

    return { list, limit };
  }
}

export const leaderboardService = new LeaderboardService();
