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
} from '@mui/material';
import type { RecentMatch } from '../../types';
import { formatDateTime, getMatchStatusLabel, getMatchStatusColor } from '../../utils/format';
import EmptyState from '../common/EmptyState';

interface TeamRecordProps {
  matches: RecentMatch[];
}

export default function TeamRecord({ matches }: TeamRecordProps) {
  if (matches.length === 0) {
    return <EmptyState title="暂无比赛记录" />;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: '#1A1D2E',
        border: '1px solid #1E2340',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-head': { color: '#8890A8', fontWeight: 700 } }}>
            <TableCell>对手</TableCell>
            <TableCell>时间</TableCell>
            <TableCell>比分</TableCell>
            <TableCell>结果</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match) => {
            const myScore = match.isTeamA ? match.teamAScore : match.teamBScore;
            const oppScore = match.isTeamA ? match.teamBScore : match.teamAScore;
            const isWin = match.winnerTeamId
              ? (match.isTeamA && match.winnerTeamId === match.teamAId) ||
                (!match.isTeamA && match.winnerTeamId === match.teamBId)
              : null;

            return (
              <TableRow
                key={match.id}
                hover
                sx={{
                  '&:hover': { bgcolor: 'rgba(200,169,81,0.04)' },
                  '& .MuiTableCell-body': { color: '#E8EAF0', borderColor: '#1E2340' },
                }}
              >
                <TableCell>
                  <Typography variant="body2">{match.opponent.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#8890A8' }}>
                    {match.stage === 'GROUP' ? '小组赛' : '淘汰赛'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#8890A8' }}>
                    {formatDateTime(match.matchTime)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#E8EAF0' }}>
                    {myScore !== null ? `${myScore} : ${oppScore}` : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {match.status === 'COMPLETED' ? (
                    <Chip
                      label={isWin ? '胜' : '负'}
                      color={isWin ? 'success' : 'error'}
                      size="small"
                    />
                  ) : (
                    <Chip
                      label={getMatchStatusLabel(match.status)}
                      color={getMatchStatusColor(match.status)}
                      size="small"
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
