import { Box, Typography, Paper } from '@mui/material';
import type { MatchItem } from '../../types';

interface BracketNodeProps {
  match: MatchItem;
}

function TeamSlot({ label, teamId, team, score, isCompleted, winnerId }: {
  label: string;
  teamId: number | null;
  team: { id: number; name: string; logoUrl: string | null } | null;
  score: number | null;
  isCompleted: boolean;
  winnerId: number | null;
}) {
  const isWinner = teamId !== null && winnerId === teamId;
  const isTbd = teamId === null || team === null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: isWinner ? 'rgba(46,125,50,0.15)' : 'transparent',
        fontWeight: isWinner ? 700 : 400,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: isTbd ? '#3A3F58' : '#E8EAF0',
          fontStyle: isTbd ? 'italic' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {isTbd ? `待定 (${label})` : team!.name}
      </Typography>
      {isCompleted && score !== null && (
        <Typography variant="body2" sx={{ color: '#E8EAF0', fontFamily: 'monospace', ml: 1 }}>
          {score}
        </Typography>
      )}
    </Box>
  );
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
        border: isCompleted ? '1px solid rgba(76,175,80,0.15)' : '1px solid #1E2340',
      }}
    >
      <TeamSlot
        label="A"
        teamId={match.teamAId}
        team={match.teamA}
        score={match.teamAScore}
        isCompleted={isCompleted}
        winnerId={winnerId}
      />
      <Box sx={{ borderTop: '1px solid #1E2340', my: 0.5 }} />
      <TeamSlot
        label="B"
        teamId={match.teamBId}
        team={match.teamB}
        score={match.teamBScore}
        isCompleted={isCompleted}
        winnerId={winnerId}
      />
    </Paper>
  );
}
