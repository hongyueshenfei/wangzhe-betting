import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import type { TeamRank } from '../../types';

interface TeamRankTableProps {
  teams: TeamRank[];
}

export default function TeamRankTable({ teams }: TeamRankTableProps) {
  if (teams.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#6B7394' }}>暂无战队排行数据</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: '#1A1D2E',
        border: '1px solid #1E2340',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-head': { color: '#8890A8', fontWeight: 700 } }}>
            <TableCell width={80}>排名</TableCell>
            <TableCell>战队</TableCell>
            <TableCell align="right">胜场</TableCell>
            <TableCell align="right">负场</TableCell>
            <TableCell align="right">弃赛胜</TableCell>
            <TableCell>赛季</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.id}
              hover
              sx={{
                '&:hover': { bgcolor: 'rgba(200,169,81,0.04)' },
                '& .MuiTableCell-body': { color: '#E8EAF0', borderColor: '#1E2340' },
              }}
            >
              <TableCell>
                {team.rank <= 3 ? (
                  <Chip
                    icon={<EmojiEvents />}
                    label={`#${team.rank}`}
                    color={team.rank === 1 ? 'warning' : team.rank === 2 ? 'default' : 'error'}
                    size="small"
                  />
                ) : (
                  `#${team.rank}`
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#0F1119',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #1E2340',
                    }}
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 14 }}>🏆</span>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#E8EAF0' }}>
                    {team.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">{team.wins}</TableCell>
              <TableCell align="right">{team.losses}</TableCell>
              <TableCell align="right">{team.forfeits}</TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ color: '#6B7394' }}>
                  {team.season.name}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
