import { describe, it, expect, beforeEach } from 'vitest';
import { checkinService } from '../src/services/checkin.service';
import { AppError } from '../src/services/auth.service';
import { cleanDatabase, createTestUser } from './helpers';
import { prisma } from '../src/utils/prisma';

describe('CheckinService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('checkin', () => {
    it('用户签到成功应获得奖励', async () => {
      const user = await createTestUser({ coins: 100 });

      const result = await checkinService.checkin(user.id);

      expect(result.earned).toBe(5);
      expect(result.newBalance).toBe(105);

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.coins).toBe(105);

      // Transaction recorded
      const tx = await prisma.coinTransaction.findFirst({
        where: { userId: user.id, type: 'CHECKIN' },
      });
      expect(tx?.amount).toBe(5);
    });

    it('同一天重复签到应被拒绝', async () => {
      const user = await createTestUser({ coins: 100 });

      await checkinService.checkin(user.id);
      await expect(checkinService.checkin(user.id)).rejects.toThrow(AppError);
    });

    it('被禁言用户不能签到', async () => {
      const user = await createTestUser({ isBanned: true });
      await expect(checkinService.checkin(user.id)).rejects.toThrow(AppError);
    });

    it('不存在的用户签到应抛错', async () => {
      await expect(checkinService.checkin(99999)).rejects.toThrow(AppError);
    });

    it('跨日签到应连续获得奖励', async () => {
      const user = await createTestUser({ coins: 100 });

      // First check-in
      await checkinService.checkin(user.id);

      // Manually set lastCheckInDate to yesterday
      const yesterday = new Date(Date.now() - 86400000);
      await prisma.user.update({
        where: { id: user.id },
        data: { lastCheckInDate: yesterday },
      });

      // Second check-in (new day)
      const result = await checkinService.checkin(user.id);
      expect(result.earned).toBe(5);
      expect(result.newBalance).toBe(110);
    });
  });
});
