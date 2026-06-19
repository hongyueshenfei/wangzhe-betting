import client from './client';
import type {
  ApiResponse,
  PaginatedList,
  MatchItem,
  MatchDetail,
} from '../types';

export interface MatchListParams {
  seasonId?: number;
  stage?: string;
  status?: string;
  groupName?: string;
  page?: number;
  limit?: number;
}

export async function getMatchList(
  params?: MatchListParams,
): Promise<PaginatedList<MatchItem>> {
  const res = await client.get<ApiResponse<PaginatedList<MatchItem>>>('/matches', {
    params,
  });
  return res.data.data!;
}

export async function getMatchById(id: number): Promise<MatchDetail> {
  const res = await client.get<ApiResponse<MatchDetail>>(`/matches/${id}`);
  return res.data.data!;
}
