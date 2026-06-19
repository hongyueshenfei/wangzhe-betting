import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { MIN_ODDS, MAX_ODDS } from '../../utils/constants';
import type { MatchItem } from '../../types';

interface OddsAdjustDialogProps {
  open: boolean;
  match: MatchItem;
  onClose: () => void;
  onSubmit: (data: { oddsA?: number; oddsB?: number }) => Promise<void>;
}

export default function OddsAdjustDialog({
  open,
  match,
  onClose,
  onSubmit,
}: OddsAdjustDialogProps) {
  const [oddsA, setOddsA] = useState<number>(match.oddsA);
  const [oddsB, setOddsB] = useState<number>(match.oddsB);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (oddsA < MIN_ODDS || oddsA > MAX_ODDS || oddsB < MIN_ODDS || oddsB > MAX_ODDS) {
      setError(`赔率范围需在 ${MIN_ODDS}-${MAX_ODDS} 之间`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ oddsA, oddsB });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '调整失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 }
      }}>
      <DialogTitle sx={{
        fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2,
        display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 17,
      }}>
        <TrendingUpIcon sx={{ color: '#C8A951' }} />
        调整赔率
        <Chip
          size="small"
          label={`${MIN_ODDS} ~ ${MAX_ODDS}`}
          sx={{
            ml: 'auto',
            bgcolor: 'rgba(200,169,81,0.1)',
            color: '#C8A951',
            fontSize: 10, fontWeight: 600,
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 2 }}>
        {/* Match info */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
          mb: 4, py: 2.5, px: 3,
          bgcolor: '#0F1119', borderRadius: 2, border: '1px solid #1E2340',
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#E8EAF0' }}>
            {match.teamA.name}
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#C8A951', fontFamily: 'monospace' }}>
            VS
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#E8EAF0' }}>
            {match.teamB.name}
          </Typography>
        </Box>

        {/* Odds inputs */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <TextField
            label={match.teamA.name}
            type="number"
            value={oddsA}
            onChange={(e) => setOddsA(Number(e.target.value))}
            fullWidth
            inputProps={{ step: 0.01, min: MIN_ODDS, max: MAX_ODDS, style: { fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#E8EAF0' } }}
            InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">
                <Typography sx={{ color: '#8890A8', fontSize: 13 }}>赔</Typography>
              </InputAdornment>,
            }}
            helperText={`当前 ${match.teamA.name} 赔率: ${match.oddsA.toFixed(2)}`}
            FormHelperTextProps={{ sx: { color: '#8890A8', fontSize: 11 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0F1119',
                '& fieldset': { borderColor: '#2A2F45' },
                '&:hover fieldset': { borderColor: '#C8A951' },
              },
            }}
          />
          <TextField
            label={match.teamB.name}
            type="number"
            value={oddsB}
            onChange={(e) => setOddsB(Number(e.target.value))}
            fullWidth
            inputProps={{ step: 0.01, min: MIN_ODDS, max: MAX_ODDS, style: { fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#E8EAF0' } }}
            InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">
                <Typography sx={{ color: '#8890A8', fontSize: 13 }}>赔</Typography>
              </InputAdornment>,
            }}
            helperText={`当前 ${match.teamB.name} 赔率: ${match.oddsB.toFixed(2)}`}
            FormHelperTextProps={{ sx: { color: '#8890A8', fontSize: 11 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0F1119',
                '& fieldset': { borderColor: '#2A2F45' },
                '&:hover fieldset': { borderColor: '#C8A951' },
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, bgcolor: 'rgba(211,47,47,0.08)', color: '#EF5350' }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: '#8890A8', fontSize: 14 }}>
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}
          sx={{
            bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, fontSize: 14, px: 3,
            '&:hover': { bgcolor: '#B8942E' },
          }}>
          {loading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
