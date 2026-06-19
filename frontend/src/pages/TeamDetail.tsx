import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { getTeamById } from '../api/teams';
import TeamRecord from '../components/team/TeamRecord';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { TeamDetail } from '../types';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamById(Number(id));
      setTeam(data);
    } catch {
      setError('加载战队详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onRetry={loadTeam} />;
  if (!team) return <ErrorAlert message="战队不存在" />;

  return (
    <Box sx={{ maxWidth: '56rem', mx: 'auto' }}>
      <Button
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: '#8890A8', fontSize: 14 }}
      >
        ← 返回
      </Button>

      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: '#0F1119',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
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
                <span style={{ fontSize: 40 }}>🏆</span>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#E8EAF0', mb: 1 }}>
              {team.name}
            </Typography>
            {team.season && (
              <Typography variant="body2" sx={{ color: '#8890A8', mb: 1.5 }}>
                赛季: {team.season.name}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Chip label={`${team.wins} 胜`} color="success" />
              <Chip label={`${team.losses} 负`} color="error" />
              <Chip
                label={`${team.forfeits} 弃赛胜`}
                sx={{
                  color: '#8890A8',
                  bgcolor: 'transparent',
                  border: '1px solid #2A2F45',
                }}
              />
            </Box>
            {team.description && (
              <Typography variant="body1" sx={{ color: '#E8EAF0', mb: 1 }}>
                {team.description}
              </Typography>
            )}
            {team.members && (
              <Typography variant="body2" sx={{ color: '#6B7394' }}>
                队员: {team.members}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Recent matches */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#E8EAF0', mb: 2 }}>
        近期比赛
      </Typography>
      <TeamRecord matches={team.recentMatches} />
    </Box>
  );
}
