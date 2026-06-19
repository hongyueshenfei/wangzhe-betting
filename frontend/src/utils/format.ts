import { BetStatus, MatchStatus } from '../types';

/** Format date string to readable format */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Format date string with time */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format coin amount */
export function formatCoins(coins: number): string {
  return `${coins} 币`;
}

/** Format odds */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/** Format win rate */
export function formatWinRate(rate: number): string {
  return `${rate}%`;
}

/** Get human-readable match status label */
export function getMatchStatusLabel(status: MatchStatus): string {
  const map: Record<MatchStatus, string> = {
    UPCOMING: '未开始',
    LIVE: '进行中',
    COMPLETED: '已结束',
    FORFEITED: '弃赛',
  };
  return map[status] || status;
}

/** Get color for match status */
export function getMatchStatusColor(status: MatchStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<MatchStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
    UPCOMING: 'primary',
    LIVE: 'warning',
    COMPLETED: 'success',
    FORFEITED: 'error',
  };
  return map[status] || 'default';
}

/** Get human-readable bet status label */
export function getBetStatusLabel(status: BetStatus): string {
  const map: Record<BetStatus, string> = {
    PENDING: '待结算',
    WON: '已赢',
    LOST: '已输',
    REFUNDED: '已退款',
  };
  return map[status] || status;
}

/** Get color for bet status */
export function getBetStatusColor(status: BetStatus): 'default' | 'success' | 'error' | 'warning' {
  const map: Record<BetStatus, 'default' | 'success' | 'error' | 'warning'> = {
    PENDING: 'warning',
    WON: 'success',
    LOST: 'error',
    REFUNDED: 'default',
  };
  return map[status] || 'default';
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
