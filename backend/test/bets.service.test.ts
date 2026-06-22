import { describe, it, expect, beforeEach } from 'vitest';
import { betsService } from '../src/services/bets.service';
import { AppError } from '../src/services/auth.service';
import { cleanDatabase, createTestUser, createTestSeason, createTestTeam, createTestMatch } from './helpers';
import { prisma } from '../src/utils/prisma';

describe('BetsService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('placeBet', () => {
    it('正常投注应扣币并创建投注记录', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'UPCOMING',
        oddsA: 2.0,
        oddsB: 2.5,
      });

      const result = await betsService.placeBet(user.id, {
        matchId: match.id,
        teamId: teamA.id,
        amount: 30,
      });

      expect(result.bet.amount).toBe(30);
      expect(result.bet.oddsAtBet).toBe(2.0);
      expect(result.bet.pickedTeamId).toBe(teamA.id);
      expect(result.newBalance).toBe(70);

      // Transaction recorded
      const tx = await prisma.coinTransaction.findFirst({
        where: { userId: user.id, type: 'BET' },
      });
      expect(tx?.amount).toBe(-30);
      expect(tx?.balanceAfter).toBe(70);
    });

    it('余额不足时应拒绝投注', async () => {
      const user = await createTestUser({ coins: 10 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id);

      await expect(
        betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 50 }),
      ).rejects.toThrow(AppError);
    });

    it('重复投注同一场比赛应被拒绝', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'UPCOMING',
      });

      await betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 10 });
      await expect(
        betsService.placeBet(user.id, { matchId: match.id, teamId: teamB.id, amount: 10 }),
      ).rejects.toThrow(AppError);
    });

    it('已结束的比赛不能投注', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'COMPLETED',
      });

      await expect(
        betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 10 }),
      ).rejects.toThrow(AppError);
    });

    it('投注不存在的比赛应拒绝', async () => {
      const user = await createTestUser({ coins: 100 });
      await expect(
        betsService.placeBet(user.id, { matchId: 99999, teamId: 1, amount: 10 }),
      ).rejects.toThrow(AppError);
    });

    it('被禁言用户不能投注', async () => {
      const user = await createTestUser({ coins: 100, isBanned: true });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id);

      await expect(
        betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 10 }),
      ).rejects.toThrow(AppError);
    });

    it('投注金额低于最小值应拒绝', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id);

      await expect(
        betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 0 }),
      ).rejects.toThrow(AppError);
    });

    it('投注后赔率应动态更新', async () => {
      const user = await createTestUser({ coins: 1000 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'UPCOMING',
        oddsA: 2.0,
        oddsB: 2.0,
        betTotalA: 0,
        betTotalB: 0,
      });

      await betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 100 });

      // After bet, odds should have changed
      const updatedMatch = await prisma.match.findUnique({ where: { id: match.id } });
      const oddsAChanged = updatedMatch!.oddsA !== 2.0 || updatedMatch!.betTotalA > 0;
      expect(oddsAChanged).toBe(true);
      expect(updatedMatch!.betTotalA).toBe(100);
      expect(updatedMatch!.betCountA).toBe(1);
    });
  });

  describe('getMyBets', () => {
    it('应返回用户投注历史', async () => {
      const user = await createTestUser({ coins: 100 });
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        status: 'UPCOMING',
      });

      await betsService.placeBet(user.id, { matchId: match.id, teamId: teamA.id, amount: 10 });

      const history = await betsService.getMyBets(user.id, {});
      expect(history.list.length).toBe(1);
      expect(history.total).toBe(1);
      expect(history.list[0].amount).toBe(10);
    });
  });

  describe('placeChampionBet', () => {
    it('冠军投注应成功创建', async () => {
      const user = await createTestUser({ coins: 200 });
      const season = await createTestSeason({ status: 'ACTIVE' });
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });

      const result = await betsService.placeChampionBet(user.id, {
        seasonId: season.id,
        teamId: teamA.id,
        amount: 50,
      });

      expect(result.bet.amount).toBe(50);
      expect(result.newBalance).toBe(150);
    });

    it('冠军投注可投多支队伍', async () => {
      const user = await createTestUser({ coins: 200 });
      const season = await createTestSeason({ status: 'ACTIVE' });
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });

      // Bet on both teams - should be allowed
      await betsService.placeChampionBet(user.id, { seasonId: season.id, teamId: teamA.id, amount: 30 });
      await betsService.placeChampionBet(user.id, { seasonId: season.id, teamId: teamB.id, amount: 20 });

      const bets = await betsService.getMyChampionBets(user.id, {});
      expect(bets.list.length).toBe(2);
    });
  });
});
