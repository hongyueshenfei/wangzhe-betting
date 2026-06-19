import { Request, Response } from 'express';
import { transactionsService } from '../services/transactions.service';
import { success } from '../utils/response';
import type { AuthRequest } from '../types';

export class TransactionsController {
  async getMyTransactions(req: Request, res: Response) {
    const userId = (req as AuthRequest).user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await transactionsService.getMyTransactions(userId, { page, limit });
    success(res, result);
  }
}

export const transactionsController = new TransactionsController();
