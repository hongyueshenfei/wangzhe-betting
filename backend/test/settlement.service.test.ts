import { describe, it, expect, beforeEach } from 'vitest';
import { settlementService } from '../src/services/settlement.service';
import { cleanDatabase, createTestUser, createTestSeason, createTestTeam, createTestMatch, createTestBet } from './helpers';
import { prisma } from '../src/utils/prisma';

async function createTestBetWithDeduction(
  userId: number, matchId: number, teamId: number,
  overrides?: { amount?: number; oddsAtBet?: number; status?: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED' },
) {
  const amount = overrides?.amount ?? 10;
  await prisma.user.update({
    where: { id: userId },
    data: { coins: { decrement: amount } },
  });
  return createTestBet(userId, matchId, teamId, overrides);
}

describe('SettlementService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('settleMatch', () => {
    it('应结算单场投注：赢家获得 amount × oddsAtBet', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'LIVE',
        oddsA: 2.5,
        oddsB: 1.5,
      });
      await createTestBetWithDeduction(user.id, match.id, teamA.id, {
        amount: 20,
        oddsAtBet: 2.5,
      });

      const result = await settlementService.settleMatch(match.id, 3, 1);

      expect(result.settledCount).toBe(1);
      expect(result.wonCount).toBe(1);
      expect(result.lostCount).toBe(0);

      // Verify bet status
      const settledBet = await prisma.bet.findUnique({ where: { id: 1 } });
      expect(settledBet?.status).toBe('WON');

      // Verify user coins: 100 - 20(bet) + 50(payout: 20 * 2.5) = 130
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.coins).toBe(130);

      // Verify transaction recorded
      const tx = await prisma.coinTransaction.findFirst({
        where: { userId: user.id, type: 'BET_WIN' },
      });
      expect(tx?.amount).toBe(50);
      expect(tx?.referenceId).toBe(1);
    });

    it('应结算单场投注：输家无赔付', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'LIVE',
      });
      await createTestBetWithDeduction(user.id, match.id, teamA.id, { amount: 30 }); // bet on A

      const result = await settlementService.settleMatch(match.id, 0, 2); // B wins

      expect(result.settledCount).toBe(1);
      expect(result.wonCount).toBe(0);
      expect(result.lostCount).toBe(1);

      // User should have 100 - 30 = 70 (no refund for losing)
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.coins).toBe(70);
    });

    it('应正确处理平局场景（看谁赢 TeamA > TeamB）', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'LIVE',
        oddsA: 3.0,
      });
      await createTestBetWithDeduction(user.id, match.id, teamA.id, { amount: 10, oddsAtBet: 3.0 });

      const result = await settlementService.settleMatch(match.id, 2, 1);
      expect(result.wonCount).toBe(1);
      expect(result.lostCount).toBe(0);
    });

    it('幂等性：重复结算不应影响已结算的投注', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'LIVE',
      });
      await createTestBetWithDeduction(user.id, match.id, teamA.id, { amount: 20, oddsAtBet: 2.0 });

      await settlementService.settleMatch(match.id, 2, 0);
      const coinsAfterFirst = (await prisma.user.findUnique({ where: { id: user.id } }))!.coins;

      await settlementService.settleMatch(match.id, 2, 0);
      const coinsAfterSecond = (await prisma.user.findUnique({ where: { id: user.id } }))!.coins;

      expect(coinsAfterSecond).toBe(coinsAfterFirst);
    });

    it('比赛不存在时返回空结果不抛错', async () => {
      const result = await settlementService.settleMatch(99999, 1, 0);
      expect(result.settledCount).toBe(0);
      expect(result.wonCount).toBe(0);
      expect(result.lostCount).toBe(0);
    });
  });

  describe('refundMatchBets', () => {
    it('弃赛场景：全额退还投注金额', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'LIVE',
      });
      await createTestBetWithDeduction(user.id, match.id, teamA.id, { amount: 50 });

      const result = await settlementService.refundMatchBets(match.id);

      expect(result.refundedCount).toBe(1);
      expect(result.totalRefunded).toBe(50);

      // User should have 100 - 50 + 50 = 100
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.coins).toBe(100);

      // Bet status should be REFUNDED
      const settledBet = await prisma.bet.findFirst({ where: { userId: user.id } });
      expect(settledBet?.status).toBe('REFUNDED');
    });
  });

  describe('settleChampionBets', () => {
    it('冠军投注：赢家按比例瓜分总池', async () => {
      const season = await createTestSeason({ status: 'ACTIVE' });
      const teamA = await createTestTeam(season.id, { name: 'TeamA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TeamB', abbr: 'TB' });

      const user1 = await createTestUser({ username: 'u1', coins: 200 });
      const user2 = await createTestUser({ username: 'u2', coins: 200 });
      const user3 = await createTestUser({ username: 'u3', coins: 200 });

      await createChampionBetWithDeduction(user1.id, season.id, teamA.id, 30);
      await createChampionBetWithDeduction(user2.id, season.id, teamB.id, 20);
      await createChampionBetWithDeduction(user3.id, season.id, teamA.id, 50);

      const result = await settlementService.settleChampionBets(season.id, teamA.id);

      expect(result.settledCount).toBe(3);
      expect(result.wonCount).toBe(2);
      expect(result.lostCount).toBe(1);
      expect(result.totalPool).toBe(100);

      // user1: 200 - 30 + 37 = 207
      const u1 = await prisma.user.findUnique({ where: { id: user1.id } });
      expect(u1?.coins).toBe(207);

      // user3: 200 - 50 + 62 = 212
      const u3 = await prisma.user.findUnique({ where: { id: user3.id } });
      expect(u3?.coins).toBe(212);

      // user2: 200 - 20 = 180 (lost)
      const u2 = await prisma.user.findUnique({ where: { id: user2.id } });
      expect(u2?.coins).toBe(180);
    });
  });
});

async function createChampionBetWithDeduction(userId: number, seasonId: number, teamId: number, amount: number) {
  await prisma.championBet.create({
    data: { userId, seasonId, teamId, amount, oddsAtBet: 0, status: 'PENDING' },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { coins: { decrement: amount } },
  });
}
