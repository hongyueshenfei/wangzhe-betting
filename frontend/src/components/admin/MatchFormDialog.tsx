import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  Chip,
  Avatar,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { MatchItem } from '../../types';

interface MatchFormDialogProps {
  open: boolean;
  match: MatchItem;
  onClose: () => void;
  onSubmit: (data: { teamAScore: number; teamBScore: number }) => Promise<void>;
}

const TEAM_COLORS = [
  '#42A5F5', '#EF5350', '#66BB6A', '#FFA726',
  '#AB47BC', '#26C6DA', '#EC407A', '#8D6E63',
  '#7E57C2', '#FDD835', '#29B6F6', '#FF7043',
];

function getTeamColor(id: number) {
  return TEAM_COLORS[(id - 1) % TEAM_COLORS.length];
}

export default function MatchFormDialog({
  open,
  match,
  onClose,
  onSubmit,
}: MatchFormDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isGroup = match.stage === 'GROUP';
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [winningTeam, setWinningTeam] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickWinner = (side: 'A' | 'B') => {
    setWinningTeam(side);
    setTeamAScore(side === 'A' ? 1 : 0);
    setTeamBScore(side === 'B' ? 1 : 0);
  };

  const handleSubmit = async () => {
    if (isGroup && !winningTeam) {
      setError('请选择胜方');
      return;
    }
    if (!isGroup && teamAScore === teamBScore) {
      setError('比分不能打平，请确认');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ teamAScore, teamBScore });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '录入失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}
      PaperProps={{
        sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: isMobile ? 0 : 3 }
      }}>
      <DialogTitle sx={{
        fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2,
        display: 'flex', alignItems: 'center', gap: 1.5
      }}>
        <EmojiEventsIcon sx={{ color: '#C8A951' }} />
        <Box>
          录入赛果
          <Typography sx={{ fontSize: 12, color: '#8890A8', fontWeight: 400 }}>
            {isGroup ? `小组赛 · ${match.groupName || ''}` : `淘汰赛 · ${match.round || ''}`}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={isGroup ? '小组赛' : '淘汰赛'}
          sx={{
            ml: 'auto',
            bgcolor: isGroup ? 'rgba(66,165,245,0.12)' : 'rgba(211,47,47,0.12)',
            color: isGroup ? '#42A5F5' : '#EF5350',
            fontSize: 10, fontWeight: 600,
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 2 }}>
        {isGroup ? (
          /* ── Group stage: pick winner ── */
          <>
            <Typography sx={{ fontSize: 14, color: '#C8A951', fontWeight: 600, mb: 3, textAlign: 'center' }}>
              点击选择胜方
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 3 }, px: { xs: 0, sm: 2 } }}>
              {/* Team A card */}
              <Paper
                onClick={() => handlePickWinner('A')}
                elevation={0}
                sx={{
                  flex: 1, py: { xs: 3, sm: 4 }, px: { xs: 1.5, sm: 2 }, cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center', borderRadius: 3,
                  bgcolor: winningTeam === 'A' ? 'rgba(200,169,81,0.15)' : '#0F1119',
                  border: '2px solid',
                  borderColor: winningTeam === 'A' ? '#C8A951' : '#1E2340',
                  '&:hover': { borderColor: '#C8A951', bgcolor: 'rgba(200,169,81,0.08)' },
                }}
              >
                {winningTeam === 'A' && (
                  <EmojiEventsIcon sx={{ fontSize: 20, color: '#C8A951', mb: 0.5 }} />
                )}
                <Avatar sx={{
                  width: { xs: 44, sm: 56 }, height: { xs: 44, sm: 56 }, mx: 'auto', mb: 1.5,
                  bgcolor: getTeamColor(match.teamA.id),
                  fontSize: { xs: 16, sm: 20 }, fontWeight: 700,
                }}>
                  {match.teamA.name.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 15 }, color: '#E8EAF0' }}>
                  {match.teamA.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8', mt: 0.5 }}>
                  赔率 {match.oddsA.toFixed(2)}
                </Typography>
              </Paper>

              {/* VS center */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#C8A951', fontFamily: 'monospace' }}>
                  VS
                </Typography>
              </Box>

              {/* Team B card */}
              <Paper
                onClick={() => handlePickWinner('B')}
                elevation={0}
                sx={{
                  flex: 1, py: { xs: 3, sm: 4 }, px: { xs: 1.5, sm: 2 }, cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center', borderRadius: 3,
                  bgcolor: winningTeam === 'B' ? 'rgba(200,169,81,0.15)' : '#0F1119',
                  border: '2px solid',
                  borderColor: winningTeam === 'B' ? '#C8A951' : '#1E2340',
                  '&:hover': { borderColor: '#C8A951', bgcolor: 'rgba(200,169,81,0.08)' },
                }}
              >
                {winningTeam === 'B' && (
                  <EmojiEventsIcon sx={{ fontSize: 20, color: '#C8A951', mb: 0.5 }} />
                )}
                <Avatar sx={{
                  width: { xs: 44, sm: 56 }, height: { xs: 44, sm: 56 }, mx: 'auto', mb: 1.5,
                  bgcolor: getTeamColor(match.teamB.id),
                  fontSize: { xs: 16, sm: 20 }, fontWeight: 700,
                }}>
                  {match.teamB.name.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 15 }, color: '#E8EAF0' }}>
                  {match.teamB.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8', mt: 0.5 }}>
                  赔率 {match.oddsB.toFixed(2)}
                </Typography>
              </Paper>
            </Box>

            {winningTeam && (
              <Alert severity="success" sx={{ mt: 3, bgcolor: 'rgba(76,175,80,0.08)', color: '#4CAF50' }}>
                已选择胜方：{winningTeam === 'A' ? match.teamA.name : match.teamB.name}
              </Alert>
            )}
          </>
        ) : (
          /* ── Knockout: score input ── */
          <>
            {/* Teams display */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1.5, sm: 3 },
              mb: 4, px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 3 },
              bgcolor: '#0F1119', borderRadius: 3, border: '1px solid #1E2340',
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Avatar sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 }, mb: 1.5, bgcolor: getTeamColor(match.teamA.id), fontSize: { xs: 18, sm: 22 }, fontWeight: 700 }}>
                  {match.teamA.name.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 16 }, color: '#E8EAF0', textAlign: 'center' }}>
                  {match.teamA.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8', mt: 0.5 }}>
                  赔率 {match.oddsA.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: { xs: 18, sm: 24 }, fontWeight: 800, color: '#C8A951', fontFamily: 'monospace', lineHeight: 1 }}>VS</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Avatar sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 }, mb: 1.5, bgcolor: getTeamColor(match.teamB.id), fontSize: { xs: 18, sm: 22 }, fontWeight: 700 }}>
                  {match.teamB.name.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 16 }, color: '#E8EAF0', textAlign: 'center' }}>
                  {match.teamB.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#8890A8', mt: 0.5 }}>
                  赔率 {match.oddsB.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: 13, color: '#8890A8', mb: 2, textAlign: 'center' }}>
              请输入最终比分
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
              <TextField
                label={match.teamA.name}
                type="number"
                value={teamAScore}
                onChange={(e) => setTeamAScore(Math.max(0, Number(e.target.value)))}
                fullWidth
                inputProps={{ min: 0, style: { fontSize: 28, fontWeight: 700, textAlign: 'center' } }}
                InputLabelProps={{ sx: { color: '#8890A8', fontSize: 13 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F1119',
                    '& fieldset': { borderColor: teamAScore === teamBScore ? '#D32F2F' : '#2A2F45' },
                    '&:hover fieldset': { borderColor: teamAScore === teamBScore ? '#D32F2F' : '#C8A951' },
                  },
                }}
              />
              <Typography sx={{ fontSize: 36, fontWeight: 800, color: '#C8A951', fontFamily: 'monospace', lineHeight: 1 }}>:</Typography>
              <TextField
                label={match.teamB.name}
                type="number"
                value={teamBScore}
                onChange={(e) => setTeamBScore(Math.max(0, Number(e.target.value)))}
                fullWidth
                inputProps={{ min: 0, style: { fontSize: 28, fontWeight: 700, textAlign: 'center' } }}
                InputLabelProps={{ sx: { color: '#8890A8', fontSize: 13 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F1119',
                    '& fieldset': { borderColor: teamAScore === teamBScore ? '#D32F2F' : '#2A2F45' },
                    '&:hover fieldset': { borderColor: teamAScore === teamBScore ? '#D32F2F' : '#C8A951' },
                  },
                }}
              />
            </Box>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3, bgcolor: 'rgba(211,47,47,0.08)', color: '#EF5350' }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: '#8890A8' }}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (isGroup && !winningTeam)}
          sx={{
            bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700,
            '&:hover': { bgcolor: '#B8942E' },
            '&.Mui-disabled': { opacity: 0.5 },
          }}
        >
          {loading ? '结算中...' : '确认结算'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
