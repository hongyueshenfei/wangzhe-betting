import { PrismaClient } from '@prisma/client';
import { CHECKIN_REWARD } from '../utils/constants';
import { AppError } from './auth.service';

const prisma = new PrismaClient();

export class CheckinService {
  /**
   * Perform daily check-in for a user.
   * - Checks that user hasn't already checked in today (comparing date part only).
   * - Adds CHECKIN_REWARD coins and records transaction.
   */
  async checkin(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    if (user.isBanned) {
      throw new AppError('账号已被封禁', 403);
    }

    // Compare date parts only
    const today = this.getDateString(new Date());
    const lastDate = user.lastCheckInDate
      ? this.getDateString(user.lastCheckInDate)
      : null;

    if (lastDate === today) {
      throw new AppError('今日已签到，请明天再来', 400);
    }

    // Perform check-in in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: CHECKIN_REWARD },
          lastCheckInDate: new Date(),
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: CHECKIN_REWARD,
          type: 'CHECKIN',
          balanceAfter: updated.coins,
        },
      });

      return { earned: CHECKIN_REWARD, newBalance: updated.coins };
    });

    return result;
  }

  /**
   * Get YYYY-MM-DD string for a date.
   */
  private getDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

export const checkinService = new CheckinService();
