import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { MatchItem } from '../../types';
import { formatDateTime, getMatchStatusLabel } from '../../utils/format';

interface MatchCardProps {
  match: MatchItem;
  hasBet?: boolean;
}

const DEFAULT_COLORS = ['#1976D2', '#E65100', '#2E7D32', '#6A1B9A', '#D32F2F', '#37474F', '#00BCD4', '#F57C00'];

const STATUS_CONFIG: Record<string, { bg: string; fg: string }> = {
  UPCOMING: { bg: 'rgba(66,165,245,0.1)', fg: '#42A5F5' },
  LIVE: { bg: 'rgba(255,152,0,0.1)', fg: '#FF9800' },
  COMPLETED: { bg: 'rgba(76,175,80,0.1)', fg: '#4CAF50' },
  FORFEITED: { bg: 'rgba(239,83,80,0.1)', fg: '#EF5350' },
};

/** 从 API team.color 或通过名称哈希得到一个战队色 */
function getTeamColor(team: { color?: string | null; name: string }): string {
  if (team.color) return team.color;
  // Fallback: 用名称哈希
  let hash = 0;
  for (let i = 0; i < team.name.length; i++) hash = team.name.charCodeAt(i) + ((hash << 5) - hash);
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

export default function MatchCard({ match, hasBet }: MatchCardProps) {
  const navigate = useNavigate();
  const st = STATUS_CONFIG[match.status] || { bg: 'rgba(255,255,255,0.05)', fg: '#8890A8' };

  const colorA = match.teamA ? getTeamColor(match.teamA) : null;
  const colorB = match.teamB ? getTeamColor(match.teamB) : null;

  // Skip rendering if teams are TBD (placeholder knockout matches)
  if (!match.teamA || !match.teamB) {
    return null;
  }

  return (
    <Box
      sx={{
        background: hasBet
          ? 'linear-gradient(135deg, rgba(200,169,81,0.12), rgba(200,169,81,0.05))'
          : 'linear-gradient(135deg, #1A1D2E, #1F2342)',
        borderRadius: 3,
        p: 2,
        border: hasBet ? '1.5px solid #C8A951' : '1px solid #242840',
        boxShadow: hasBet ? '0 0 16px rgba(200,169,81,0.25), inset 0 0 20px rgba(200,169,81,0.05)' : 'none',
        transition: 'all 0.2s',
        '&:hover': { borderColor: hasBet ? '#C8A951' : 'rgba(200,169,81,0.3)' },
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/matches/${match.id}`)}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography sx={{ fontSize: 11, color: '#8890A8' }}>
            {match.stage === 'GROUP' ? `小组赛 · ${match.groupName || ''}` : `淘汰赛 · ${match.round || ''}`}
          </Typography>
          {hasBet && (
            <Typography
              component="span"
              sx={{
                fontSize: 11, fontWeight: 800, color: '#1A1D2E',
                bgcolor: '#C8A951', px: 1.2, py: 0.3, borderRadius: 0.8,
                lineHeight: 1.4, letterSpacing: 0.5,
                boxShadow: '0 0 8px rgba(200,169,81,0.4)',
              }}
            >
              已投
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: 10, color: st.fg, bgcolor: st.bg, px: 1, py: 0.3, borderRadius: 1, fontWeight: 600 }}>
          {getMatchStatusLabel(match.status)}
        </Typography>
      </Box>

      {/* Teams */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        {/* Team A */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 0.6 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 1.5,
            background: `linear-gradient(135deg, ${colorA}, ${colorA}dd)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#FFF',
          }}>
            {match.teamA.abbr || match.teamA.name.slice(0, 2)}
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            {match.teamA.name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#C8A951', bgcolor: 'rgba(200,169,81,0.1)', px: 1.5, py: 0.4, borderRadius: 1, fontWeight: 700 }}>
            赔率 {match.oddsA.toFixed(2)}
          </Typography>
        </Box>

        {/* VS / Score */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
          {match.status === 'COMPLETED' || match.status === 'FORFEITED' ? (
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: match.winnerTeamId === match.teamAId ? '#4CAF50' : '#E8EAF0' }}>
              {match.teamAScore} : {match.teamBScore}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#C8A951' }}>VS</Typography>
          )}
          <Typography sx={{ fontSize: 10, color: '#8890A8', mt: 0.5 }}>{formatDateTime(match.matchTime)}</Typography>
        </Box>

        {/* Team B */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 0.6 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 1.5,
            background: `linear-gradient(135deg, ${colorB}, ${colorB}dd)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#FFF',
          }}>
            {match.teamB.abbr || match.teamB.name.slice(0, 2)}
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            {match.teamB.name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#C8A951', bgcolor: 'rgba(200,169,81,0.1)', px: 1.5, py: 0.4, borderRadius: 1, fontWeight: 700 }}>
            赔率 {match.oddsB.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Centered Action */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
        <Button
          size="small"
          onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.id}`); }}
          sx={{
            background: 'linear-gradient(135deg, #D32F2F, #E53935)', color: '#FFF',
            fontWeight: 700, fontSize: 13, px: 2.5, py: 0.6, borderRadius: 1.5,
            '&:hover': { background: 'linear-gradient(135deg, #B71C1C, #D32F2F)' },
          }}
        >
          {match.status === 'UPCOMING' ? '立即投注' : '详情'}
        </Button>
      </Box>
    </Box>
  );
}
