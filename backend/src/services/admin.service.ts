import { MatchStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class AdminService {
  /**
   * Get admin dashboard statistics.
   */
  async getDashboard() {
    const [
      totalUsers,
      totalBettors,
      totalMatches,
      totalBets,
      totalSeasons,
      activeSeasons,
      completedMatches,
      upcomingMatches,
      totalBetAmount,
      totalTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BETTOR' } }),
      prisma.match.count(),
      prisma.bet.count(),
      prisma.season.count(),
      prisma.season.count({ where: { status: 'ACTIVE' } }),
      prisma.match.count({ where: { status: MatchStatus.COMPLETED } }),
      prisma.match.count({ where: { status: MatchStatus.UPCOMING } }),
      prisma.bet.aggregate({ _sum: { amount: true } }),
      prisma.coinTransaction.count(),
    ]);

    // Total coins in circulation
    const coinsAgg = await prisma.user.aggregate({ _sum: { coins: true } });

    return {
      totalUsers,
      totalBettors,
      totalMatches,
      totalBets,
      totalSeasons,
      activeSeasons,
      completedMatches,
      upcomingMatches,
      totalBetAmount: totalBetAmount._sum.amount || 0,
      totalCoinsInCirculation: coinsAgg._sum.coins || 0,
      totalTransactions,
    };
  }
}

export const adminService = new AdminService();
