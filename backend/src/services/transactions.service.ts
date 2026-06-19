import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionsService {
  /**
   * Get current user's transaction history.
   */
  async getMyTransactions(userId: number, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coinTransaction.count({ where: { userId } }),
    ]);

    return { list, total, page, limit };
  }
}

export const transactionsService = new TransactionsService();
