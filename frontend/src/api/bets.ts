import client from './client';
import type {
  ApiResponse,
  PaginatedList,
  Bet,
  ChampionBet,
} from '../types';

export interface PlaceBetParams {
  matchId: number;
  teamId: number;
  amount: number;
}

export interface BetResult {
  bet: Bet;
  newBalance: number;
}

export interface ChampionBetResult {
  bet: ChampionBet;
  newBalance: number;
}

export interface MyBetsParams {
  status?: string;
  seasonId?: number;
  page?: number;
  limit?: number;
}

export async function placeBet(params: PlaceBetParams): Promise<BetResult> {
  const res = await client.post<ApiResponse<BetResult>>('/bets', params);
  return res.data.data!;
}

export async function getMyBets(
  params?: MyBetsParams,
): Promise<PaginatedList<Bet>> {
  const res = await client.get<ApiResponse<PaginatedList<Bet>>>('/bets/mine', {
    params,
  });
  return res.data.data!;
}

export async function placeChampionBet(params: {
  seasonId: number;
  teamId: number;
  amount: number;
}): Promise<ChampionBetResult> {
  const res = await client.post<ApiResponse<ChampionBetResult>>(
    '/bets/champion',
    params,
  );
  return res.data.data!;
}

export async function getMyChampionBets(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedList<ChampionBet>> {
  const res = await client.get<ApiResponse<PaginatedList<ChampionBet>>>(
    '/bets/champion/mine',
    { params },
  );
  return res.data.data!;
}

export interface ChampionPoolStats {
  totalPool: number;
  betCount: number;
  deadline: string | null;
}

export async function getChampionPoolStats(
  seasonId: number,
): Promise<ChampionPoolStats> {
  const res = await client.get<ApiResponse<ChampionPoolStats>>(
    `/bets/champion/pool/${seasonId}`,
  );
  return res.data.data!;
}
