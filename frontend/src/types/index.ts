// ─── Enums ───────────────────────────────────────────

export type Role = 'ADMIN' | 'BETTOR';
export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
export type MatchStage = 'GROUP' | 'KNOCKOUT';
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'FORFEITED';
export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

// ─── User ────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  role: Role;
  coins: number;
  isBanned: boolean;
  lastCheckInDate: string | null;
  createdAt: string;
  updatedAt: string;
  canCheckIn?: boolean;
}

export interface UserPublic {
  id: number;
  username: string;
  createdAt: string;
}

// ─── Season ──────────────────────────────────────────

export interface Season {
  id: number;
  name: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  championTeamId: number | null;
  championTeam: { id: number; name: string; logoUrl: string | null } | null;
  tournamentConfig: TournamentConfig | null;
  teams?: Team[];
  _count?: { teams: number; matches: number };
  createdAt: string;
  updatedAt: string;
}

// ─── Team Member Positions ─────────────────────────

export interface TeamMemberPositions {
  topLaner?: string;    // 上单
  midLaner?: string;    // 中单
  adc?: string;         // 射手
  support?: string;     // 游走
  jungler?: string;     // 打野
  substitute?: string;  // 替补
}

// ─── Team ────────────────────────────────────────────

export interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  members: string | null;        // JSON string of TeamMemberPositions
  posterUrl: string | null;      // 战队海报
  seasonId: number | null;
  season?: { id: number; name: string; status?: SeasonStatus };
  wins: number;
  losses: number;
  forfeits: number;
  createdAt: string;
}

export interface TeamDetail extends Team {
  recentMatches: RecentMatch[];
}

export interface RecentMatch {
  id: number;
  matchTime: string;
  stage: MatchStage;
  status: MatchStatus;
  teamAScore: number | null;
  teamBScore: number | null;
  winnerTeamId: number | null;
  opponent: { id: number; name: string };
  isTeamA: boolean;
}

// ─── Match ───────────────────────────────────────────

export interface MatchItem {
  id: number;
  seasonId: number;
  season?: { id: number; name: string };
  stage: MatchStage;
  groupName: string | null;
  round: string | null;
  matchOrder: number | null;
  teamAId: number;
  teamBId: number;
  teamA: { id: number; name: string; logoUrl: string | null };
  teamB: { id: number; name: string; logoUrl: string | null };
  teamAScore: number | null;
  teamBScore: number | null;
  matchTime: string;
  status: MatchStatus;
  forfeitTeamId: number | null;
  forfeitTeam?: { id: number; name: string } | null;
  winnerTeamId: number | null;
  winnerTeam?: { id: number; name: string } | null;
  oddsA: number;
  oddsB: number;
  betTotalA: number;
  betTotalB: number;
  betCountA: number;
  betCountB: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchDetail extends MatchItem {
  teamA: { id: number; name: string; logoUrl: string | null; wins: number; losses: number; members: string | null };
  teamB: { id: number; name: string; logoUrl: string | null; wins: number; losses: number; members: string | null };
  _count?: { bets: number };
  userBet?: { amount: number; pickedTeamId: number; oddsAtBet: number } | null;
}

// ─── Bet ─────────────────────────────────────────────

export interface Bet {
  id: number;
  userId: number;
  matchId: number;
  pickedTeamId: number;
  pickedTeam?: { id: number; name: string; logoUrl: string | null };
  amount: number;
  oddsAtBet: number;
  status: BetStatus;
  createdAt: string;
  settledAt: string | null;
  match?: {
    id: number;
    teamA: { id: number; name: string; logoUrl: string | null };
    teamB: { id: number; name: string; logoUrl: string | null };
    season: { id: number; name: string };
  };
}

// ─── ChampionBet ─────────────────────────────────────

export interface ChampionBet {
  id: number;
  userId: number;
  seasonId: number;
  teamId: number;
  team?: { id: number; name: string; logoUrl: string | null };
  season?: { id: number; name: string; status: SeasonStatus };
  amount: number;
  oddsAtBet: number;
  status: BetStatus;
  createdAt: string;
  settledAt: string | null;
}

// ─── Odds ────────────────────────────────────────────

export interface MatchOdds {
  id: number;
  oddsA: number;
  oddsB: number;
  betTotalA: number;
  betTotalB: number;
  betCountA: number;
  betCountB: number;
}

// ─── Leaderboard ─────────────────────────────────────

export interface UserRank {
  rank: number;
  userId: number;
  username: string;
  coins: number;
  winCount: number;
  lossCount: number;
  totalBets: number;
  winRate: number;
}

export interface TeamRank {
  rank: number;
  id: number;
  name: string;
  logoUrl: string | null;
  wins: number;
  losses: number;
  forfeits: number;
  season: { id: number; name: string };
}

// ─── Admin ───────────────────────────────────────────

export interface AdminDashboard {
  totalUsers: number;
  totalBettors: number;
  totalMatches: number;
  totalBets: number;
  totalSeasons: number;
  activeSeasons: number;
  completedMatches: number;
  upcomingMatches: number;
  totalBetAmount: number;
  totalCoinsInCirculation: number;
  totalTransactions: number;
}

// ─── Tournament Config ───────────────────────────────

export type RoundType = 'round_robin' | 'knockout';

export interface RoundConfig {
  name: string;                    // 轮次名称，如"小组积分赛"
  type: RoundType;                 // 赛制类型
  order: number;                   // 轮次序号（1-based）
  matchFormat: 'BO1' | 'BO3' | 'BO5';  // 比赛局数
  // 循环赛专属
  groups?: number;                 // 分组数
  teamsPerGroup?: number;          // 每组队伍数
  pointsWin?: number;              // 胜场积分
  pointsDraw?: number;             // 平局积分
  pointsLoss?: number;             // 负场积分
  promotionCount?: number;         // 每组晋级人数
  // 淘汰赛专属
  seedingRule?: 'cross_group' | 'auto' | 'manual';  // 对阵规则
  rounds?: number;                 // 淘汰赛轮次数（半决赛=2，决赛=1等）
}

export interface TournamentConfig {
  rounds: RoundConfig[];          // 多轮配置
}

// ─── API Response ────────────────────────────────────

export interface ApiResponse<T = unknown> {
  code: 0 | 1;
  data?: T;
  message?: string;
}

export interface PaginatedList<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Group Standing ──────────────────────────────────

export interface GroupStanding {
  groupName: string;
  teams: {
    teamId: number;
    teamName: string;
    wins: number;
    losses: number;
    points: number;
  }[];
}
