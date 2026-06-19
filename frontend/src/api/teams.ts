import client from './client';
import type { ApiResponse, PaginatedList, Team, TeamDetail } from '../types';

export interface TeamListParams {
  seasonId?: number;
  keyword?: string;
  page?: number;
  limit?: number;
}

export async function getTeamList(
  params?: TeamListParams,
): Promise<PaginatedList<Team>> {
  const res = await client.get<ApiResponse<PaginatedList<Team>>>('/teams', {
    params,
  });
  return res.data.data!;
}

export async function getTeamById(id: number): Promise<TeamDetail> {
  const res = await client.get<ApiResponse<TeamDetail>>(`/teams/${id}`);
  return res.data.data!;
}
