import client from './client';
import type {
  ApiResponse,
  PaginatedList,
  User,
  AdminDashboard,
  Season,
  Team,
  TeamMemberPositions,
  MatchItem,
  MatchOdds,
} from '../types';

// ─── Dashboard ───────────────────────────────────────

export async function getDashboard(): Promise<AdminDashboard> {
  const res = await client.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
  return res.data.data!;
}

// ─── Users ───────────────────────────────────────────

export async function getAdminUsers(params?: {
  keyword?: string;
  isBanned?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedList<User>> {
  const res = await client.get<ApiResponse<PaginatedList<User>>>('/admin/users', {
    params,
  });
  return res.data.data!;
}

export async function banUser(userId: number): Promise<User> {
  const res = await client.put<ApiResponse<User>>(`/admin/users/${userId}/ban`);
  return res.data.data!;
}

export async function unbanUser(userId: number): Promise<User> {
  const res = await client.put<ApiResponse<User>>(`/admin/users/${userId}/unban`);
  return res.data.data!;
}

export async function adjustCoins(
  userId: number,
  amount: number,
  reason?: string,
): Promise<{ userId: number; newBalance: number }> {
  const res = await client.put<ApiResponse<{ userId: number; newBalance: number }>>(
    `/admin/users/${userId}/coins`,
    { amount, reason },
  );
  return res.data.data!;
}

export async function resetPassword(
  userId: number,
  newPassword: string,
): Promise<{ userId: number; message: string }> {
  const res = await client.post<ApiResponse<{ userId: number; message: string }>>(
    `/admin/users/${userId}/reset-password`,
    { newPassword },
  );
  return res.data.data!;
}

export async function batchCreateUsers(users: Array<{
  username: string; password: string; initialCoins?: number;
}>): Promise<{ created: Array<{ id: number; username: string }>; skipped: string[]; total: number }> {
  const res = await client.post<ApiResponse<{
    created: Array<{ id: number; username: string }>; skipped: string[]; total: number;
  }>>('/admin/users/batch', { users });
  return res.data.data!;
}

// ─── Seasons ─────────────────────────────────────────

export async function createSeason(data: {
  name: string;
  startDate: string;
  endDate: string;
  config?: any;
}): Promise<Season> {
  const res = await client.post<ApiResponse<Season>>('/seasons', data);
  return res.data.data!;
}

export async function updateSeason(
  id: number,
  data: { name?: string; startDate?: string; endDate?: string; status?: string; config?: { rounds: import('../types').RoundConfig[] } },
): Promise<Season> {
  const res = await client.put<ApiResponse<Season>>(`/seasons/${id}`, data);
  return res.data.data!;
}

export async function setChampion(
  seasonId: number,
  championTeamId: number,
): Promise<{ season: Season; settlement: unknown }> {
  const res = await client.put<ApiResponse<{ season: Season; settlement: unknown }>>(
    `/seasons/${seasonId}/champion`,
    { championTeamId },
  );
  return res.data.data!;
}

// ─── Teams ───────────────────────────────────────────

export async function createTeam(data: {
  name: string;
  description?: string;
  seasonId?: number;
  logoUrl?: string;
  posterUrl?: string;
  memberPositions?: TeamMemberPositions;
}): Promise<Team> {
  // Serialize memberPositions to JSON if provided
  const payload: Record<string, unknown> = {
    name: data.name,
    description: data.description,
    seasonId: data.seasonId,
    logoUrl: data.logoUrl,
    posterUrl: data.posterUrl,
  };
  if (data.memberPositions) {
    payload.memberPositions = data.memberPositions;
  }
  const res = await client.post<ApiResponse<Team>>('/teams', payload);
  return res.data.data!;
}

export async function updateTeam(
  id: number,
  data: {
    name?: string;
    description?: string;
    logoUrl?: string;
    posterUrl?: string;
    memberPositions?: TeamMemberPositions;
  },
): Promise<Team> {
  const payload: Record<string, unknown> = {
    name: data.name,
    description: data.description,
    logoUrl: data.logoUrl,
    posterUrl: data.posterUrl,
  };
  if (data.memberPositions) {
    payload.memberPositions = data.memberPositions;
  }
  const res = await client.put<ApiResponse<Team>>(`/teams/${id}`, payload);
  return res.data.data!;
}

export async function deleteTeam(id: number): Promise<void> {
  await client.delete(`/teams/${id}`);
}

// ─── Matches ─────────────────────────────────────────

export async function generateMatches(data: {
  seasonId: number;
  groups?: string[];
  startDate?: string;
  matchesPerDay?: number;
}): Promise<{ created: number; matches: MatchItem[] }> {
  const res = await client.post<ApiResponse<{ created: number; matches: MatchItem[] }>>(
    '/matches/generate',
    data,
  );
  return res.data.data!;
}

export async function generateKnockoutMatches(seasonId: number): Promise<{
  created: number;
  matches: MatchItem[];
}> {
  const res = await client.post<
    ApiResponse<{ created: number; matches: MatchItem[] }>
  >('/matches/generate-knockout', { seasonId });
  return res.data.data!;
}

export async function updateMatchResult(
  matchId: number,
  data: { teamAScore: number; teamBScore: number },
): Promise<{ match: MatchItem; settlement: unknown }> {
  const res = await client.put<
    ApiResponse<{ match: MatchItem; settlement: unknown }>
  >(`/matches/${matchId}`, data);
  return res.data.data!;
}

export async function forfeitMatch(
  matchId: number,
  forfeitTeamId: number,
): Promise<{ match: MatchItem; refund: unknown }> {
  const res = await client.put<
    ApiResponse<{ match: MatchItem; refund: unknown }>
  >(`/matches/${matchId}/forfeit`, { forfeitTeamId });
  return res.data.data!;
}

// ─── Match Time ─────────────────────────────────────

export async function updateMatchTime(
  matchId: number,
  matchTime: string,
): Promise<MatchItem> {
  const res = await client.patch<ApiResponse<MatchItem>>(
    `/matches/${matchId}/time`,
    { matchTime },
  );
  return res.data.data!;
}

// ─── Odds ────────────────────────────────────────────

export async function updateOdds(
  matchId: number,
  data: { oddsA?: number; oddsB?: number },
): Promise<MatchOdds> {
  const res = await client.put<ApiResponse<MatchOdds>>(`/odds/${matchId}`, data);
  return res.data.data!;
}

// ─── Upload ──────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<ApiResponse<{ url: string; filename: string }>>(
    '/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data.data!;
}
