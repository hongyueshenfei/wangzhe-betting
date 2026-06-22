import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from './auth.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';
import { prisma } from '../utils/prisma';

export class UsersService {
  /**
   * Get current user's full profile (including balance and check-in status).
   */
  async getMyProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        coins: true,
        isBanned: true,
        lastCheckInDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // Determine if user can check in today
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.lastCheckInDate
      ? user.lastCheckInDate.toISOString().slice(0, 10)
      : null;
    const canCheckIn = lastDate !== today;

    return { ...user, canCheckIn };
  }

  /**
   * Update current user's profile (password change only for now).
   */
  async updateMyProfile(userId: number, data: { password?: string }) {
    if (data.password) {
      if (data.password.length < 6) {
        throw new AppError('密码长度不能少于 6 位', 400);
      }
      const passwordHash = await hashPassword(data.password);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    }

    return this.getMyProfile(userId);
  }

  /**
   * Get public user info by ID.
   */
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    return user;
  }

  /**
   * Get paginated user list (admin).
   */
  async getUserList(params: {
    keyword?: string;
    isBanned?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.keyword) {
      where.username = { contains: params.keyword };
    }
    if (params.isBanned !== undefined) {
      where.isBanned = params.isBanned;
    }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          role: true,
          coins: true,
          isBanned: true,
          lastCheckInDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { list, total, page, limit };
  }

  /**
   * Ban a user (admin).
   */
  async banUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    if (user.role === 'ADMIN') {
      throw new AppError('不能封禁管理员', 400);
    }
    return prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });
  }

  /**
   * Unban a user (admin).
   */
  async unbanUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    return prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });
  }

  /**
   * Adjust user coin balance (admin).
   */
  async adjustCoins(userId: number, amount: number, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const newBalance = user.coins + amount;
    if (newBalance < 0) {
      throw new AppError('调整后余额不能为负数', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { coins: newBalance },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          type: 'ADMIN_ADJUST',
          referenceType: reason || '管理员调整',
          balanceAfter: newBalance,
        },
      });
    });

    return { userId, newBalance };
  }

  /**
   * Reset a user's password (admin).
   */
  async resetPassword(userId: number, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { userId, message: '密码已重置' };
  }

  /**
   * Batch create users (admin). Skips duplicates.
   */
  async batchCreateUsers(users: Array<{ username: string; password: string; initialCoins?: number }>) {
    const created: Array<{ id: number; username: string }> = [];
    const skipped: string[] = [];

    for (const u of users) {
      if (!u.username || !u.password) continue;
      const existing = await prisma.user.findUnique({ where: { username: u.username } });
      if (existing) {
        skipped.push(u.username);
        continue;
      }
      const hashedPassword = await hashPassword(u.password);
      const initialCoins = u.initialCoins || 100;
      const user = await prisma.user.create({
        data: {
          username: u.username,
          passwordHash: hashedPassword,
          coins: initialCoins,
        },
      });
      // Record initial coin transaction
      await prisma.coinTransaction.create({
        data: {
          userId: user.id,
          amount: initialCoins,
          type: 'INITIAL',
          balanceAfter: initialCoins,
        },
      });
      created.push({ id: user.id, username: user.username });
    }

    return { created, skipped, total: created.length };
  }
}

export const usersService = new UsersService();
