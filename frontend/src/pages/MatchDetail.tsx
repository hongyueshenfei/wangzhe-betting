import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import { getMatchById } from '../api/matches';
import BetModal from '../components/bet/BetModal';
import OddsDisplay from '../components/bet/OddsDisplay';
import BracketView from '../components/match/BracketView';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import { formatDateTime, getMatchStatusLabel, getMatchStatusColor } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import type { MatchDetail, MatchItem } from '../types';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [betModalOpen, setBetModalOpen] = useState(false);

  const loadMatch = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchById(Number(id));
      setMatch(data);
    } catch {
      setError('加载比赛详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onRetry={loadMatch} />;
  if (!match) return <ErrorAlert message="比赛不存在" />;

  const canBet =
    isAuthenticated &&
    (match.status === 'UPCOMING' || match.status === 'LIVE');

  return (
    <Box sx={{ maxWidth: '56rem', mx: 'auto' }}>
      {/* Back */}
      <Button
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: '#8890A8', fontSize: 14 }}
      >
        ← 返回
      </Button>

      {/* Match header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Chip
            label={getMatchStatusLabel(match.status)}
            color={getMatchStatusColor(match.status)}
            sx={{ mb: 1 }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: '#8890A8', mb: 2, display: 'block' }}
        >
          {match.season?.name} · {match.stage === 'GROUP' ? `小组赛 ${match.groupName || ''}` : `淘汰赛 ${match.round || ''}`}
        </Typography>

        {/* Teams + Score */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: { xs: 1, sm: 3 },
        }}>
          {/* Team A */}
          <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 56, sm: 80 }, height: { xs: 56, sm: 80 },
                borderRadius: '50%',
                bgcolor: '#0F1119',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 1, overflow: 'hidden',
                border: '2px solid #1E2340',
              }}
            >
              {match.teamA.logoUrl ? (
                <img src={match.teamA.logoUrl} alt={match.teamA.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 22 }}>🏆</span>
              )}
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#E8EAF0', fontSize: { xs: 12, sm: 16 }, wordBreak: 'break-all' }}>
              {match.teamA.name}
            </Typography>
            <Typography sx={{ color: '#6B7394', fontSize: { xs: 10, sm: 12 } }}>
              {match.teamA.wins}胜{match.teamA.losses}负
            </Typography>
          </Box>

          {/* VS / Score center */}
          <Box sx={{ textAlign: 'center', flexShrink: 0, px: { xs: 1, sm: 2 } }}>
            {match.status === 'COMPLETED' || match.status === 'FORFEITED' ? (
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#E8EAF0', fontSize: { xs: 24, sm: 36 }, lineHeight: 1.2 }}>
                  {match.teamAScore} : {match.teamBScore}
                </Typography>
                {match.winnerTeam && (
                  <Chip
                    label={`${match.winnerTeam.name} 获胜`}
                    color="success"
                    size="small"
                    sx={{ mt: 0.5, fontSize: { xs: 10, sm: 12 } }}
                  />
                )}
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#6B7394', fontSize: { xs: 22, sm: 28 }, lineHeight: 1.2 }}>
                  VS
                </Typography>
                <Typography sx={{ color: '#8890A8', fontSize: { xs: 10, sm: 13 } }}>
                  {formatDateTime(match.matchTime)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Team B */}
          <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 56, sm: 80 }, height: { xs: 56, sm: 80 },
                borderRadius: '50%',
                bgcolor: '#0F1119',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 1, overflow: 'hidden',
                border: '2px solid #1E2340',
              }}
            >
              {match.teamB.logoUrl ? (
                <img src={match.teamB.logoUrl} alt={match.teamB.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 22 }}>🏆</span>
              )}
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#E8EAF0', fontSize: { xs: 12, sm: 16 }, wordBreak: 'break-all' }}>
              {match.teamB.name}
            </Typography>
            <Typography sx={{ color: '#6B7394', fontSize: { xs: 10, sm: 12 } }}>
              {match.teamB.wins}胜{match.teamB.losses}负
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Team Members */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 }, mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography sx={{ mb: 2, fontWeight: 700, color: '#E8EAF0', fontSize: { xs: 14, sm: 16 } }}>
          👥 队员阵容
        </Typography>
        <Box sx={{
          display: 'flex', gap: { xs: 1, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          {(['teamA', 'teamB'] as const).map((side) => {
            const teamData = match[side];
            const members: Record<string, string> = (() => {
              try { return teamData.members ? JSON.parse(teamData.members) : {}; }
              catch { return {}; }
            })();
            const positions = [
              { key: 'topLaner', label: '上单' },
              { key: 'jungler', label: '打野' },
              { key: 'midLaner', label: '中单' },
              { key: 'adc', label: '射手' },
              { key: 'support', label: '游走' },
              { key: 'substitute', label: '替补' },
            ];

            return (
              <Box key={side} sx={{
                flex: 1, bgcolor: '#0F1119', borderRadius: 2, p: { xs: 1.5, sm: 2 },
                border: `1px solid ${side === 'teamA' ? 'rgba(66,165,245,0.15)' : 'rgba(239,83,80,0.15)'}`,
              }}>
                <Typography sx={{
                  fontWeight: 700, mb: 1.5, fontSize: { xs: 13, sm: 14 },
                  color: side === 'teamA' ? '#42A5F5' : '#EF5350',
                }}>
                  {teamData.name}
                </Typography>
                {positions.map((pos) => (
                  <Box key={pos.key} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#6B7394', fontWeight: 600, minWidth: 40 }}>
                      {pos.label}
                    </Typography>
                    <Typography sx={{
                      fontSize: { xs: 12, sm: 13 }, color: members[pos.key] ? '#E8EAF0' : '#3A3F58',
                      fontWeight: 500, textAlign: 'right',
                    }}>
                      {members[pos.key] || '未填写'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Odds + Bet */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#E8EAF0' }}>
          赔率信息
        </Typography>
        <OddsDisplay
          teamAName={match.teamA.name}
          teamBName={match.teamB.name}
          oddsA={match.oddsA}
          oddsB={match.oddsB}
          betTotalA={match.betTotalA}
          betTotalB={match.betTotalB}
        />

        {/* User's bet info */}
        {match.userBet && (
          <Box sx={{
            mt: 2, mb: 2, p: 2,
            bgcolor: 'rgba(200,169,81,0.08)',
            border: '1px solid rgba(200,169,81,0.2)',
            borderRadius: 2,
          }}>
            <Typography sx={{ fontWeight: 700, color: '#C8A951', fontSize: 14, mb: 0.5 }}>
              ✅ 你已投注
            </Typography>
            <Typography sx={{ color: '#E8EAF0', fontSize: 13 }}>
              已投{' '}
              <strong style={{ color: '#C8A951' }}>
                {match.userBet.pickedTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}
              </strong>
              {' '}· <strong>{match.userBet.amount}</strong> 币
              {match.userBet.oddsAtBet ? ` · 赔率 ${match.userBet.oddsAtBet.toFixed(2)}` : ''}
            </Typography>
            <Typography sx={{ color: '#6B7394', fontSize: 11, mt: 0.5 }}>
              每场比赛只能投注一次，不可追加
            </Typography>
          </Box>
        )}

        {canBet && !match.userBet && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                bgcolor: '#C8A951',
                color: '#0F1119',
                fontWeight: 700,
                '&:hover': { bgcolor: '#B8942E' },
              }}
              onClick={() => setBetModalOpen(true)}
            >
              💰 立即投注
            </Button>
          </Box>
        )}

        {match.userBet && canBet && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled
              sx={{
                bgcolor: 'rgba(200,169,81,0.15)',
                color: '#6B7394',
                fontWeight: 700,
              }}
            >
              ✅ 已投注 {match.userBet.amount} 币
            </Button>
          </Box>
        )}

        {!isAuthenticated && match.status === 'UPCOMING' && (
          <Alert
            severity="info"
            sx={{
              mt: 3,
              bgcolor: 'rgba(2,136,209,0.1)',
              color: '#4FC3F7',
              '& .MuiAlert-icon': { color: '#4FC3F7' },
            }}
          >
            请先登录后再投注
          </Alert>
        )}
      </Paper>

      {/* Bet count */}
      <Typography variant="body2" sx={{ color: '#6B7394', mb: 3 }}>
        已有 {match._count?.bets || 0} 人投注
      </Typography>

      {/* Bet Modal */}
      <BetModal
        open={betModalOpen}
        match={match}
        onClose={() => setBetModalOpen(false)}
        onSuccess={loadMatch}
      />
    </Box>
  );
}
