import {
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import type { CoinTransaction } from '../../api/transactions';
import { formatDateTime } from '../../utils/format';
import EmptyState from '../common/EmptyState';

const TYPE_LABELS: Record<string, string> = {
  INITIAL: '注册奖励',
  CHECKIN: '每日签到',
  BET: '投注支出',
  BET_WIN: '投注获胜',
  BET_LOST: '投注失败',
  BET_REFUND: '退款',
  CHAMPION_BET: '冠军投注',
  CHAMPION_WIN: '冠军投注获胜',
  CHAMPION_LOST: '冠军投注失败',
  CHAMPION_REFUND: '冠军投注退款',
  ADMIN_ADJUST: '管理员调整',
};

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  INITIAL: { bg: 'rgba(102,187,106,0.1)', fg: '#66BB6A' },
  CHECKIN: { bg: 'rgba(200,169,81,0.12)', fg: '#C8A951' },
  BET: { bg: 'rgba(239,83,80,0.1)', fg: '#EF5350' },
  BET_WIN: { bg: 'rgba(76,175,80,0.12)', fg: '#66BB6A' },
  BET_LOST: { bg: 'rgba(136,144,168,0.1)', fg: '#8890A8' },
  BET_REFUND: { bg: 'rgba(66,165,245,0.1)', fg: '#42A5F5' },
  CHAMPION_BET: { bg: 'rgba(239,83,80,0.1)', fg: '#EF5350' },
  CHAMPION_WIN: { bg: 'rgba(76,175,80,0.12)', fg: '#66BB6A' },
  CHAMPION_LOST: { bg: 'rgba(136,144,168,0.1)', fg: '#8890A8' },
  CHAMPION_REFUND: { bg: 'rgba(66,165,245,0.1)', fg: '#42A5F5' },
  ADMIN_ADJUST: { bg: 'rgba(255,183,77,0.12)', fg: '#FFB74D' },
};

interface TransactionListProps {
  transactions: CoinTransaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) return <EmptyState title="暂无流水记录" description="还没有任何金币变动" />;

  return (
    <Stack spacing={1}>
      {transactions.map((tx) => {
        const info = TYPE_LABELS[tx.type] || tx.type;
        const color = TYPE_COLORS[tx.type] || { bg: 'rgba(255,255,255,0.05)', fg: '#8890A8' };
        const isPositive = tx.amount > 0;

        return (
          <Box key={tx.id} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: '#1A1D2E', borderRadius: 2, p: { xs: 1.5, sm: 2 },
            border: '1px solid #242840',
          }}>
            <Chip
              label={info}
              size="small"
              sx={{ bgcolor: color.bg, color: color.fg, fontWeight: 600, fontSize: 11 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, color: '#6B7394' }}>
                {formatDateTime(tx.createdAt)}
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
              color: isPositive ? '#66BB6A' : '#EF5350',
            }}>
              {isPositive ? '+' : ''}{tx.amount} 币
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
