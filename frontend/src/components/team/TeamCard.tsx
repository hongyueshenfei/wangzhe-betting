import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Team } from '../../types';

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        bgcolor: '#1A1D2E',
        border: '1px solid #1E2340',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderColor: '#2A2F45',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#0F1119',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            overflow: 'hidden',
            border: '2px solid #1E2340',
          }}
        >
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 28 }}>🏆</span>
          )}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#E8EAF0', mb: 1 }}>
          {team.name}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
          <Chip label={`${team.wins} 胜`} size="small" color="success" />
          <Chip label={`${team.losses} 负`} size="small" color="error" />
        </Box>

        {team.season && (
          <Typography variant="caption" sx={{ color: '#8890A8', mb: 1.5, display: 'block' }}>
            赛季: {team.season.name}
          </Typography>
        )}

        <Button
          size="small"
          fullWidth
          onClick={() => navigate(`/teams/${team.id}`)}
          sx={{
            color: '#8890A8',
            borderColor: '#2A2F45',
            '&:hover': { borderColor: '#C8A951', color: '#C8A951', bgcolor: 'rgba(200,169,81,0.05)' },
          }}
        >
          查看详情
        </Button>
      </CardContent>
    </Card>
  );
}
