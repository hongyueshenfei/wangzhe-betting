// ─── Business Constants ──────────────────────────────

/** API base URL — uses Vite proxy in dev mode to avoid CORS issues */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** Default pagination */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

/** Bet limits */
export const MIN_BET_AMOUNT = 1;
export const MAX_BET_AMOUNT = 10000;

/** Odds range */
export const MIN_ODDS = 1.1;
export const MAX_ODDS = 5.0;

// ─── Match Stage Labels ──────────────────────────────

export const MATCH_STAGE_LABELS = {
  GROUP: '小组赛',
  KNOCKOUT: '淘汰赛',
} as const;

// ─── Match Status Labels ─────────────────────────────

export const MATCH_STATUS_LABELS = {
  UPCOMING: '未开始',
  LIVE: '进行中',
  COMPLETED: '已结束',
  FORFEITED: '弃赛',
} as const;

// ─── Bet Status Labels ───────────────────────────────

export const BET_STATUS_LABELS = {
  PENDING: '待结算',
  WON: '已赢',
  LOST: '已输',
  REFUNDED: '已退款',
} as const;

// ─── Season Status Labels ────────────────────────────

export const SEASON_STATUS_LABELS = {
  UPCOMING: '即将开始',
  ACTIVE: '进行中',
  COMPLETED: '已结束',
} as const;

// ─── Knockout Round Labels ───────────────────────────

export const KNOCKOUT_ROUNDS = [
  '半决赛',
  '决赛',
] as const;
