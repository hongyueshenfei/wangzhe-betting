import { Box, Typography } from '@mui/material';
import type { UserRank } from '../../types';
import EmptyState from '../common/EmptyState';

const GOLD = { bg: 'linear-gradient(135deg, #C8A951, #D4A843)', fg: '#0F1119' };
const SILVER = { bg: 'linear-gradient(135deg, #9E9E9E, #BDBDBD)', fg: '#FFF' };
const BRONZE = { bg: 'linear-gradient(135deg, #8D6E63, #A1887F)', fg: '#FFF' };

const AVATAR_COLORS = ['#C8A951', '#607D8B', '#795548', '#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#00838F'];

/** 前三名奖牌图标 */
function MedalIcon({ rank }: { rank: number }) {
  const emojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
      {emojis[rank] || null}
    </Box>
  );
}

interface UserRankTableProps {
  users: UserRank[];
  currentUserId?: number;
}

export default function UserRankTable({ users, currentUserId }: UserRankTableProps) {
  if (users.length === 0) return <EmptyState title="暂无排行数据" />;

  return (
    <Box>
      {users.map((user) => {
        const rank = user.rank;
        const rankStyle = rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : null;
        const isPodium = rank <= 3;
        const isCurrentUser = user.userId === currentUserId;

        return (
          <Box key={user.userId} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, px: 1.5, borderRadius: 2, mb: 0.5,
            bgcolor: isPodium ? '#1F2342' : '#1A1D2E',
            border: isCurrentUser
              ? '1.5px solid rgba(200,169,81,0.35)'
              : isPodium
                ? '1px solid rgba(200,169,81,0.12)'
                : '1px solid transparent',
            boxShadow: isCurrentUser ? '0 0 12px rgba(200,169,81,0.12)' : 'none',
          }}>
            {/* Rank — 前三名显示奖牌，其余显示数字 */}
            {isPodium ? (
              <MedalIcon rank={rank} />
            ) : (
              <Box sx={{
                width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: rankStyle?.bg || '#242840',
                color: rankStyle?.fg || '#8890A8',
              }}>{rank}</Box>
            )}

            {/* Avatar */}
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#FFF',
              bgcolor: AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length],
              outline: isCurrentUser ? '2px solid #C8A951' : 'none',
            }}>{user.username.charAt(0)}</Box>

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: isCurrentUser ? '#C8A951' : '#E8EAF0' }}>
                  {user.username}
                </Typography>
                {isCurrentUser && (
                  <Typography sx={{ fontSize: 10, color: '#C8A951', fontWeight: 700 }}>
                    (你)
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Coins */}
            <Typography sx={{
              fontSize: 14, fontWeight: 700,
              color: rank === 1 ? '#C8A951' : isCurrentUser ? '#C8A951' : '#8890A8',
            }}>
              {user.coins} 币
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
