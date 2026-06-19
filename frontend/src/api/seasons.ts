import client from './client';
import type { ApiResponse, PaginatedList, Season } from '../types';

export interface SeasonListParams {
  status?: string;
  page?: number;
  limit?: number;
}

export async function getSeasonList(
  params?: SeasonListParams,
): Promise<PaginatedList<Season>> {
  const res = await client.get<ApiResponse<PaginatedList<Season>>>('/seasons', {
    params,
  });
  return res.data.data!;
}

export async function getSeasonById(id: number): Promise<Season> {
  const res = await client.get<ApiResponse<Season>>(`/seasons/${id}`);
  return res.data.data!;
}
