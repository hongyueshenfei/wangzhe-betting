import { Request } from 'express';
import { Role } from '@prisma/client';

// ─── API Response ────────────────────────────────────

/** Unified API response format */
export interface ApiResponse<T = unknown> {
  code: 0 | 1;
  data?: T;
  message?: string;
}

/** Paginated list wrapper */
export interface PaginatedList<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Auth ────────────────────────────────────────────

/** JWT payload stored in token */
export interface JwtPayload {
  userId: number;
  role: Role;
}

/** Extended Request with authenticated user */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── DTOs ────────────────────────────────────────────

/** Auth DTOs */
export interface RegisterDTO {
  username: string;
  password: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

/** Season DTOs */
export interface CreateSeasonDTO {
  name: string;
  startDate: string;
  endDate: string;
  config?: any;  // TournamentConfig JSON
}

export interface UpdateSeasonDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  config?: any;  // TournamentConfig JSON
}

export interface SetChampionDTO {
  championTeamId: number;
}

/** Team member positions */
export interface TeamMemberPositions {
  topLaner?: string;
  midLaner?: string;
  adc?: string;
  support?: string;
  jungler?: string;
  substitute?: string;
}

/** Team DTOs */
export interface CreateTeamDTO {
  name: string;
  description?: string;
  members?: string;
  seasonId?: number;
  posterUrl?: string;
  color?: string;
  abbr?: string;
  memberPositions?: TeamMemberPositions;
}

export interface UpdateTeamDTO {
  name?: string;
  description?: string;
  members?: string;
  posterUrl?: string;
  color?: string;
  abbr?: string;
  memberPositions?: TeamMemberPositions;
}

/** Match DTOs */
export interface GenerateMatchesDTO {
  seasonId: number;
  groups?: string[];
  startDate?: string;       // 赛程开始日期
  matchesPerDay?: number;    // 每天比赛场数，默认 2
}

export interface UpdateMatchResultDTO {
  teamAScore: number;
  teamBScore: number;
}

export interface ForfeitMatchDTO {
  forfeitTeamId: number;
}

/** Bet DTOs */
export interface PlaceBetDTO {
  matchId: number;
  teamId: number;
  amount: number;
}

export interface PlaceChampionBetDTO {
  seasonId: number;
  teamId: number;
  amount: number;
}

/** Odds DTOs */
export interface UpdateOddsDTO {
  oddsA?: number;
  oddsB?: number;
}

/** Admin DTOs */
export interface AdminCoinsDTO {
  amount: number;
  reason?: string;
}

// ─── Query Params ────────────────────────────────────

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SeasonQuery extends PaginationQuery {
  status?: string;
}

export interface TeamQuery extends PaginationQuery {
  seasonId?: string;
  keyword?: string;
}

export interface MatchQuery extends PaginationQuery {
  seasonId?: string;
  stage?: string;
  status?: string;
  groupName?: string;
}

export interface BetQuery extends PaginationQuery {
  status?: string;
  seasonId?: string;
}

export interface UserQuery extends PaginationQuery {
  keyword?: string;
  isBanned?: string;
}

export interface LeaderboardQuery {
  seasonId?: string;
  limit?: string;
}
