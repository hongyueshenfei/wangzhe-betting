import client from './client';
import type { ApiResponse, UserRank, TeamRank } from '../types';

export interface UserLeaderboardResult {
  list: UserRank[];
  limit: number;
}

export interface TeamLeaderboardResult {
  list: TeamRank[];
  limit: number;
}

export async function getUserLeaderboard(params?: {
  seasonId?: number;
  limit?: number;
}): Promise<UserLeaderboardResult> {
  const res = await client.get<ApiResponse<UserLeaderboardResult>>(
    '/leaderboard/users',
    { params },
  );
  return res.data.data!;
}

export async function getTeamLeaderboard(params?: {
  seasonId?: number;
  limit?: number;
}): Promise<TeamLeaderboardResult> {
  const res = await client.get<ApiResponse<TeamLeaderboardResult>>(
    '/leaderboard/teams',
    { params },
  );
  return res.data.data!;
}
