import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import type { Bet } from '../../types';
import { formatDateTime, formatCoins, getBetStatusLabel, getBetStatusColor } from '../../utils/format';
import EmptyState from '../common/EmptyState';

interface BetHistoryProps {
  bets: Bet[];
}

export default function BetHistory({ bets }: BetHistoryProps) {
  if (bets.length === 0) {
    return <EmptyState title="暂无投注记录" description="你还没有进行过投注" />;
  }

  return (
    <>
      {/* Desktop table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>比赛</TableCell>
              <TableCell>投注战队</TableCell>
              <TableCell align="right">金额</TableCell>
              <TableCell align="right">赔率</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bets.map((bet) => (
              <TableRow key={bet.id} hover>
                <TableCell>
                  {bet.match ? (
                    <Box>
                      <Typography variant="body2">
                        {bet.match.teamA.name} VS {bet.match.teamB.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bet.match.season?.name}
                      </Typography>
                    </Box>
                  ) : bet.pickedTeam ? (
                    <Typography variant="body2">
                      冠军投注 · {bet.pickedTeam.name}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      比赛 #{bet.matchId}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {bet.pickedTeam?.name || `战队 #${bet.pickedTeamId}`}
                </TableCell>
                <TableCell align="right">{formatCoins(bet.amount)}</TableCell>
                <TableCell align="right">{bet.oddsAtBet.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={getBetStatusLabel(bet.status)}
                    color={getBetStatusColor(bet.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDateTime(bet.createdAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile cards */}
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {bets.map((bet) => (
          <Box
            key={bet.id}
            sx={{
              bgcolor: '#1A1D2E', borderRadius: 2, p: 2,
              border: '1px solid #242840',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  {bet.match
                    ? `${bet.match.teamA.name} VS ${bet.match.teamB.name}`
                    : bet.pickedTeam
                      ? `冠军投注 · ${bet.pickedTeam.name}`
                      : `比赛 #${bet.matchId}`}
                </Typography>
                {bet.match?.season?.name && (
                  <Typography sx={{ fontSize: 11, color: '#8890A8' }}>
                    {bet.match.season.name}
                  </Typography>
                )}
              </Box>
              <Chip
                label={getBetStatusLabel(bet.status)}
                color={getBetStatusColor(bet.status)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#8890A8' }}>
                  投注: {bet.pickedTeam?.name || `#${bet.pickedTeamId}`}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8', mt: 0.3 }}>
                  {formatDateTime(bet.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#C8A951' }}>
                  {formatCoins(bet.amount)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8' }}>
                  赔率 {bet.oddsAtBet.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </>
  );
}
