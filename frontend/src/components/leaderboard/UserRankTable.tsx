import { Box, Typography } from '@mui/material';
import type { UserRank } from '../../types';
import EmptyState from '../common/EmptyState';

const GOLD = { bg: 'linear-gradient(135deg, #C8A951, #D4A843)', fg: '#0F1119' };
const SILVER = { bg: '#8890A8', fg: '#FFF' };
const BRONZE = { bg: '#8D6E63', fg: '#FFF' };

const AVATAR_COLORS = ['#C8A951', '#607D8B', '#795548', '#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#00838F'];

interface UserRankTableProps { users: UserRank[]; }

export default function UserRankTable({ users }: UserRankTableProps) {
  if (users.length === 0) return <EmptyState title="暂无排行数据" />;

  return (
    <Box>
      {users.map((user, i) => {
        const rank = user.rank;
        const rankStyle = rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : null;
        const isHighlight = rank <= 1;

        return (
          <Box key={user.userId} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, px: 1.5, borderRadius: 2, mb: 0.5,
            bgcolor: isHighlight ? '#1F2342' : '#1A1D2E',
            border: isHighlight ? '1px solid rgba(200,169,81,0.12)' : '1px solid transparent',
          }}>
            {/* Rank */}
            <Box sx={{
              width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
              background: rankStyle?.bg || '#242840',
              color: rankStyle?.fg || '#8890A8',
            }}>{rank}</Box>

            {/* Avatar */}
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#FFF',
              background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})`,
            }}>{user.username.charAt(0)}</Box>

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.username}</Typography>
              <Typography sx={{ fontSize: 10, color: '#6B7394' }}>
                {user.winCount}胜{user.lossCount}负 · 胜率 {user.winRate}%
              </Typography>
            </Box>

            {/* Coins */}
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: rank === 1 ? '#C8A951' : '#8890A8' }}>
              {user.coins} 币
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
