import { BetStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class SettlementService {
  /**
   * Settle all bets on a match after the result is recorded.
   *
   * - PENDING bets with pickedTeamId == winnerTeamId → WON (payout: amount * oddsAtBet)
   * - PENDING bets with pickedTeamId != winnerTeamId → LOST
   * - Idempotent: only processes PENDING bets
   */
  async settleMatch(
    matchId: number,
    teamAScore: number,
    teamBScore: number,
  ) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { bets: { where: { status: BetStatus.PENDING } } },
    });
    if (!match) return { settledCount: 0, wonCount: 0, lostCount: 0 };

    const winnerTeamId =
      teamAScore > teamBScore ? match.teamAId : match.teamBId;

    const pendingBets = match.bets;
    let wonCount = 0;
    let lostCount = 0;

    // Process each bet in a transaction
    for (const bet of pendingBets) {
      const isWin = bet.pickedTeamId === winnerTeamId;

      await prisma.$transaction(async (tx) => {
        if (isWin) {
          const payout = Math.floor(bet.amount * bet.oddsAtBet);
          await tx.bet.update({
            where: { id: bet.id },
            data: { status: BetStatus.WON, settledAt: new Date() },
          });
          const updatedUser = await tx.user.update({
            where: { id: bet.userId },
            data: { coins: { increment: payout } },
          });
          await tx.coinTransaction.create({
            data: {
              userId: bet.userId,
              amount: payout,
              type: 'BET_WIN',
              referenceType: 'bet',
              referenceId: bet.id,
              balanceAfter: updatedUser.coins,
            },
          });
          wonCount++;
        } else {
          await tx.bet.update({
            where: { id: bet.id },
            data: { status: BetStatus.LOST, settledAt: new Date() },
          });
          await tx.coinTransaction.create({
            data: {
              userId: bet.userId,
              amount: 0,
              type: 'BET_LOST',
              referenceType: 'bet',
              referenceId: bet.id,
              balanceAfter: (await tx.user.findUnique({ where: { id: bet.userId } }))!.coins,
            },
          });
          lostCount++;
        }
      });
    }

    return { settledCount: pendingBets.length, wonCount, lostCount };
  }

  /**
   * Refund all bets on a match (forfeit scenario).
   * All PENDING bets are refunded at full amount.
   */
  async refundMatchBets(matchId: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { bets: { where: { status: BetStatus.PENDING } } },
    });
    if (!match) return { refundedCount: 0, totalRefunded: 0 };

    let totalRefunded = 0;

    for (const bet of match.bets) {
      await prisma.$transaction(async (tx) => {
        await tx.bet.update({
          where: { id: bet.id },
          data: { status: BetStatus.REFUNDED, settledAt: new Date() },
        });
        const updatedUser = await tx.user.update({
          where: { id: bet.userId },
          data: { coins: { increment: bet.amount } },
        });
        await tx.coinTransaction.create({
          data: {
            userId: bet.userId,
            amount: bet.amount,
            type: 'BET_REFUND',
            referenceType: 'bet',
            referenceId: bet.id,
            balanceAfter: updatedUser.coins,
          },
        });
        totalRefunded += bet.amount;
      });
    }

    return { refundedCount: match.bets.length, totalRefunded };
  }

  /**
   * Settle all champion bets when season champion is set.
   * Winners share the total pool proportionally to their bet amount.
   * No odds — pure pool distribution.
   */
  async settleChampionBets(seasonId: number, championTeamId: number) {
    const bets = await prisma.championBet.findMany({
      where: { seasonId, status: BetStatus.PENDING },
    });

    // Calculate total pool and winner pool
    const totalPool = bets.reduce((sum, b) => sum + b.amount, 0);
    const winnerBets = bets.filter((b) => b.teamId === championTeamId);
    const winnerTotal = winnerBets.reduce((sum, b) => sum + b.amount, 0);

    let wonCount = 0;
    let lostCount = 0;

    for (const bet of bets) {
      const isWin = bet.teamId === championTeamId;

      await prisma.$transaction(async (tx) => {
        if (isWin && winnerTotal > 0) {
          // Proportional share: (myBet / totalWinnerBets) * totalPool
          const payout = Math.floor((bet.amount / winnerTotal) * totalPool);
          await tx.championBet.update({
            where: { id: bet.id },
            data: { status: BetStatus.WON, settledAt: new Date() },
          });
          const updatedUser = await tx.user.update({
            where: { id: bet.userId },
            data: { coins: { increment: payout } },
          });
          await tx.coinTransaction.create({
            data: {
              userId: bet.userId,
              amount: payout,
              type: 'CHAMPION_WIN',
              referenceType: 'champion_bet',
              referenceId: bet.id,
              balanceAfter: updatedUser.coins,
            },
          });
          wonCount++;
        } else {
          await tx.championBet.update({
            where: { id: bet.id },
            data: { status: BetStatus.LOST, settledAt: new Date() },
          });
          await tx.coinTransaction.create({
            data: {
              userId: bet.userId,
              amount: 0,
              type: 'CHAMPION_LOST',
              referenceType: 'champion_bet',
              referenceId: bet.id,
              balanceAfter: (await tx.user.findUnique({ where: { id: bet.userId } }))!.coins,
            },
          });
          lostCount++;
        }
      });
    }

    return { settledCount: bets.length, wonCount, lostCount, totalPool, winnerTotal };
  }
}

export const settlementService = new SettlementService();
