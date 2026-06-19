import client from './client';
import type { ApiResponse, PaginatedList } from '../types';

export interface CoinTransaction {
  id: number;
  userId: number;
  amount: number;
  type: string;
  referenceType: string | null;
  referenceId: number | null;
  balanceAfter: number;
  createdAt: string;
}

export async function getMyTransactions(params: {
  page?: number;
  limit?: number;
}): Promise<PaginatedList<CoinTransaction>> {
  const res = await client.get<ApiResponse<PaginatedList<CoinTransaction>>>('/transactions/my', { params });
  return res.data.data!;
}
