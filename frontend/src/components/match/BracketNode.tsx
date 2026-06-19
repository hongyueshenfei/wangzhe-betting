import { Box, Typography, Paper } from '@mui/material';
import type { MatchItem } from '../../types';

interface BracketNodeProps {
  match: MatchItem;
}

export default function BracketNode({ match }: BracketNodeProps) {
  const isCompleted = match.status === 'COMPLETED' || match.status === 'FORFEITED';
  const winnerId = match.winnerTeamId;

  return (
    <Paper
      sx={{
        p: 1.5,
        width: '100%',
        maxWidth: 220,
        bgcolor: isCompleted ? '#141723' : '#1A1D2E',
        border: '1px solid #1E2340',
      }}
    >
      {/* Team A */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: winnerId === match.teamAId ? 'rgba(46,125,50,0.15)' : 'transparent',
          fontWeight: winnerId === match.teamAId ? 700 : 400,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#E8EAF0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {match.teamA.name}
        </Typography>
        {isCompleted && (
          <Typography variant="body2" sx={{ color: '#E8EAF0', fontFamily: 'monospace', ml: 1 }}>
            {match.teamAScore}
          </Typography>
        )}
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: '1px solid #1E2340', my: 0.5 }} />

      {/* Team B */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: winnerId === match.teamBId ? 'rgba(46,125,50,0.15)' : 'transparent',
          fontWeight: winnerId === match.teamBId ? 700 : 400,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#E8EAF0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {match.teamB.name}
        </Typography>
        {isCompleted && (
          <Typography variant="body2" sx={{ color: '#E8EAF0', fontFamily: 'monospace', ml: 1 }}>
            {match.teamBScore}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
