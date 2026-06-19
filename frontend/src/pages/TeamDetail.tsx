import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import { getTeamById } from '../api/teams';
import TeamRecord from '../components/team/TeamRecord';
import SectionCard from '../components/common/SectionCard';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { TeamDetail } from '../types';

const POSITION_LABELS: Record<string, string> = {
  topLaner: '上单', jungler: '打野', midLaner: '中单',
  adc: '射手', support: '游走', substitute: '替补',
};

/** 解析 members JSON 并渲染为成员标签网格 */
function MemberGrid({ membersStr }: { membersStr: string }) {
  let members: Record<string, string> = {};
  try { members = JSON.parse(membersStr); } catch { return <span>{membersStr}</span>; }

  const entries = Object.entries(members).filter(([, v]) => v);
  if (entries.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
      {entries.map(([key, value]) => (
        <Box key={key} sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1.2, py: 0.4, borderRadius: 1,
          bgcolor: '#0F1119', border: '1px solid #242840',
        }}>
          <Typography sx={{ fontSize: 11, color: '#8890A8', fontWeight: 600 }}>
            {POSITION_LABELS[key] || key}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#E8EAF0', fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

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
      <SectionCard>
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
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#8890A8', mb: 0.8, fontWeight: 600 }}>
                  队员阵容
                </Typography>
                <MemberGrid membersStr={team.members} />
              </Box>
            )}
          </Grid>
        </Grid>
      </SectionCard>

      {/* Recent matches */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#E8EAF0', mb: 2 }}>
        近期比赛
      </Typography>
      <TeamRecord matches={team.recentMatches} />
    </Box>
  );
}
