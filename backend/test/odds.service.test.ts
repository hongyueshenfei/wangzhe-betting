import { describe, it, expect, beforeEach } from 'vitest';
import { oddsService } from '../src/services/odds.service';
import { AppError } from '../src/services/auth.service';
import { cleanDatabase, createTestSeason, createTestTeam, createTestMatch } from './helpers';

describe('OddsService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('recalculateOdds', () => {
    it('无投注时赔率应为默认值 2.0', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        betTotalA: 0,
        betTotalB: 0,
      });

      await oddsService.recalculateOdds(match.id);
      const updated = await oddsService.getOdds(match.id);

      expect(updated.oddsA).toBe(2.0);
      expect(updated.oddsB).toBe(2.0);
    });

    it('投注偏向一方时，该方赔率应降低，另一方升高', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        betTotalA: 900,
        betTotalB: 100,
      });

      await oddsService.recalculateOdds(match.id);
      const updated = await oddsService.getOdds(match.id);

      // A heavily backed - odds should be lower than default
      expect(updated.oddsA).toBeLessThan(2.0);
      // B not backed - odds should be higher than default
      expect(updated.oddsB).toBeGreaterThan(2.0);
      // But within valid range
      expect(updated.oddsA).toBeGreaterThanOrEqual(1.3);
      expect(updated.oddsB).toBeLessThanOrEqual(5.0);
    });

    it('赔率应在 [1.3, 5.0] 范围内', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });

      // Extreme: all bets on one side
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        betTotalA: 10000,
        betTotalB: 0,
      });

      await oddsService.recalculateOdds(match.id);
      const updated = await oddsService.getOdds(match.id);

      expect(updated.oddsA).toBeGreaterThanOrEqual(1.3);
      expect(updated.oddsA).toBeLessThanOrEqual(5.0);
      expect(updated.oddsB).toBeGreaterThanOrEqual(1.3);
      expect(updated.oddsB).toBeLessThanOrEqual(5.0);
    });

    it('赔率保留两位小数', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        betTotalA: 333,
        betTotalB: 777,
      });

      await oddsService.recalculateOdds(match.id);
      const updated = await oddsService.getOdds(match.id);

      const decimalA = updated.oddsA.toString().split('.')[1];
      const decimalB = updated.oddsB.toString().split('.')[1];
      expect(decimalA?.length ?? 0).toBeLessThanOrEqual(2);
      expect(decimalB?.length ?? 0).toBeLessThanOrEqual(2);
    });

    it('BASE_BET 应防止极端赔率', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });

      // With BASE_BET=300, even if all bets on A, oddsB shouldn't be too extreme
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        betTotalA: 5000,
        betTotalB: 1,
      });

      await oddsService.recalculateOdds(match.id);
      const updated = await oddsService.getOdds(match.id);

      // Without BASE_BET: adjustedPool = 5001, oddsB = 5001/301 = 16.6 (too high)
      // With BASE_BET=300: adjustedPool = 5601, oddsB = 5601/601 = 9.32
      // But MAX_ODDS = 5.0, so it should be capped at 5.0
      expect(updated.oddsB).toBeLessThanOrEqual(5.0);
      expect(updated.oddsB).toBeGreaterThan(2.0);
      expect(updated.oddsA).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getOdds', () => {
    it('比赛不存在时抛 AppError', async () => {
      await expect(oddsService.getOdds(99999)).rejects.toThrow(AppError);
    });
  });

  describe('updateOdds', () => {
    it('管理员可手动调整赔率', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id, {
        oddsA: 2.0,
        oddsB: 2.0,
      });

      await oddsService.updateOdds(match.id, 3.5, 1.5);
      const updated = await oddsService.getOdds(match.id);

      expect(updated.oddsA).toBe(3.5);
      expect(updated.oddsB).toBe(1.5);
    });

    it('超出范围的赔率应被拒绝', async () => {
      const season = await createTestSeason();
      const teamA = await createTestTeam(season.id, { name: 'TA', abbr: 'TA' });
      const teamB = await createTestTeam(season.id, { name: 'TB', abbr: 'TB' });
      const match = await createTestMatch(season.id, teamA.id, teamB.id);

      await expect(oddsService.updateOdds(match.id, 0.5)).rejects.toThrow(AppError);
      await expect(oddsService.updateOdds(match.id, 10.0)).rejects.toThrow(AppError);
    });
  });
});
