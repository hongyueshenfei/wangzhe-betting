import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import type { Team } from '../../types';

interface ChampionBetCardProps {
  team: Team;
  seasonId: number;
  canBet: boolean;
  hasBet: boolean;
  onBet: (teamId: number) => void;
}

export default function ChampionBetCard({
  team,
  canBet,
  hasBet,
  onBet,
}: ChampionBetCardProps) {
  return (
    <Card
      sx={{
        bgcolor: '#1A1D2E',
        border: hasBet ? '1.5px solid #C8A951' : '1px solid #1E2340',
        boxShadow: hasBet ? '0 0 12px rgba(200,169,81,0.15)' : 'none',
        position: 'relative',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: hasBet
            ? '0 0 16px rgba(200,169,81,0.25)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          borderColor: hasBet ? '#C8A951' : '#2A2F45',
        },
      }}
    >
      {/* 已投 badge */}
      {hasBet && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: '#C8A951',
            color: '#1A1D2E',
            fontSize: 10,
            fontWeight: 800,
            px: 1,
            py: 0.3,
            borderRadius: '2px',
            zIndex: 2,
            boxShadow: '0 0 6px rgba(200,169,81,0.5)',
            lineHeight: 1.4,
          }}
        >
          已投
        </Box>
      )}
      <CardContent sx={{ textAlign: 'center', pt: hasBet ? 3 : 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#0F1119',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
            overflow: 'hidden',
            border: hasBet ? '2px solid #C8A951' : '2px solid #1E2340',
          }}
        >
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 22 }}>🏆</span>
          )}
        </Box>
        <Typography sx={{ fontWeight: 700, color: '#E8EAF0', fontSize: 14, mb: 1 }}>
          {team.name}
        </Typography>
        <Typography sx={{ fontSize: 10, color: '#8890A8', mb: 1.5 }}>
          奖池模式 · 按比例分奖
        </Typography>
        <Button
          variant="contained"
          size="small"
          fullWidth
          disabled={!canBet || hasBet}
          onClick={() => onBet(team.id)}
          sx={{
            bgcolor: hasBet ? '#2A2F45' : canBet ? '#C8A951' : '#2A2F45',
            color: hasBet ? '#6B7394' : canBet ? '#0F1119' : '#6B7394',
            fontWeight: 700,
            '&:hover': canBet && !hasBet ? { bgcolor: '#B8942E' } : {},
          }}
        >
          {hasBet ? '已投注' : canBet ? '投注冠军' : '已截止'}
        </Button>
      </CardContent>
    </Card>
  );
}
