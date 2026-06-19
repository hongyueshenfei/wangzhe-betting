import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import BetForm from './BetForm';
import { useAuth } from '../../hooks/useAuth';
import type { MatchDetail } from '../../types';

interface BetModalProps {
  open: boolean;
  match: MatchDetail;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BetModal({ open, match, onClose, onSuccess }: BetModalProps) {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}
      PaperProps={{
        sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: isMobile ? 0 : 3 }
      }}>
      <DialogTitle sx={{
        fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2,
        display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 17,
      }}>
        <PaidIcon sx={{ color: '#C8A951' }} />
        投注
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {/* Match info */}
        <Box sx={{
          mb: 3, p: 2.5,
          bgcolor: '#0F1119', borderRadius: 2, border: '1px solid #1E2340',
          textAlign: 'center',
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#E8EAF0', mb: 1.5 }}>
            {match.teamA.name}
            <Typography component="span" sx={{ color: '#C8A951', mx: 1.5, fontWeight: 800 }}>VS</Typography>
            {match.teamB.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Chip
              label={`${match.teamA.name} 赔率 ${match.oddsA.toFixed(2)}`}
              size="small"
              sx={{
                bgcolor: 'rgba(200,169,81,0.1)', color: '#C8A951',
                border: '1px solid rgba(200,169,81,0.2)', fontSize: 11, fontWeight: 600,
              }}
            />
            <Chip
              label={`${match.teamB.name} 赔率 ${match.oddsB.toFixed(2)}`}
              size="small"
              sx={{
                bgcolor: 'rgba(200,169,81,0.1)', color: '#C8A951',
                border: '1px solid rgba(200,169,81,0.2)', fontSize: 11, fontWeight: 600,
              }}
            />
          </Box>
          <Typography sx={{
            mt: 1.5, fontSize: 11, color: '#FFA726',
            bgcolor: 'rgba(255,167,38,0.08)', px: 1.5, py: 0.6,
            borderRadius: 1, textAlign: 'center', lineHeight: 1.5,
          }}>
            ⚠️ 当前为实时赔率，赔率会随下注数量动态变动，请以最终确认时为准
          </Typography>
        </Box>

        {!isAuthenticated ? (
          <Typography sx={{ color: '#EF5350', textAlign: 'center', py: 3, fontSize: 14 }}>
            请先登录后再投注
          </Typography>
        ) : (
          <BetForm match={match} onSuccess={onSuccess} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
