import { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import { placeBet } from '../../api/bets';
import { useAuth } from '../../hooks/useAuth';
import { MIN_BET_AMOUNT } from '../../utils/constants';
import type { MatchDetail } from '../../types';

interface BetFormProps {
  match: MatchDetail;
  onSuccess: () => void;
  onClose: () => void;
}

export default function BetForm({ match, onSuccess, onClose }: BetFormProps) {
  const { user, setUser } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(MIN_BET_AMOUNT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOdds =
    selectedTeamId === match.teamAId
      ? match.oddsA
      : selectedTeamId === match.teamBId
        ? match.oddsB
        : null;

  const potentialWin =
    selectedOdds && amount > 0 ? Math.floor(amount * selectedOdds) : 0;

  const handleSubmit = async () => {
    if (!selectedTeamId || amount < MIN_BET_AMOUNT) {
      setError('请选择投注战队并输入有效金额');
      return;
    }

    if (user && amount > user.coins) {
      setError('余额不足');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await placeBet({
        matchId: match.id,
        teamId: selectedTeamId,
        amount,
      });

      if (user) {
        setUser({ ...user, coins: result.newBalance });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '投注失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Select team */}
      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#C8A951', mb: 1.5 }}>
        选择投注战队
      </Typography>
      <RadioGroup
        value={selectedTeamId || ''}
        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
      >
        <Paper
          elevation={0}
          onClick={() => setSelectedTeamId(match.teamAId)}
          sx={{
            mb: 1, p: 1.5, cursor: 'pointer', borderRadius: 2,
            bgcolor: selectedTeamId === match.teamAId ? 'rgba(200,169,81,0.1)' : '#0F1119',
            border: '1px solid',
            borderColor: selectedTeamId === match.teamAId ? '#C8A951' : '#1E2340',
            '&:hover': { borderColor: '#C8A951' },
          }}
        >
          <FormControlLabel
            value={match.teamAId}
            control={<Radio sx={{ color: '#8890A8', '&.Mui-checked': { color: '#C8A951' } }} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#E8EAF0' }}>
                  {match.teamA.name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#C8A951', fontWeight: 600 }}>
                  赔率 {match.oddsA.toFixed(2)}
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Paper
          elevation={0}
          onClick={() => setSelectedTeamId(match.teamBId)}
          sx={{
            p: 1.5, cursor: 'pointer', borderRadius: 2,
            bgcolor: selectedTeamId === match.teamBId ? 'rgba(200,169,81,0.1)' : '#0F1119',
            border: '1px solid',
            borderColor: selectedTeamId === match.teamBId ? '#C8A951' : '#1E2340',
            '&:hover': { borderColor: '#C8A951' },
          }}
        >
          <FormControlLabel
            value={match.teamBId}
            control={<Radio sx={{ color: '#8890A8', '&.Mui-checked': { color: '#C8A951' } }} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#E8EAF0' }}>
                  {match.teamB.name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#C8A951', fontWeight: 600 }}>
                  赔率 {match.oddsB.toFixed(2)}
                </Typography>
              </Box>
            }
          />
        </Paper>
      </RadioGroup>

      {/* Amount */}
      <TextField
        label="投注金额"
        type="number"
        value={amount}
        onChange={(e) => setAmount(Math.max(MIN_BET_AMOUNT, Number(e.target.value)))}
        fullWidth
        inputProps={{ min: MIN_BET_AMOUNT, max: user?.coins || 99999, style: { color: '#E8EAF0', fontSize: 16 } }}
        InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
        InputProps={{
          endAdornment: <InputAdornment position="end">
            <Typography sx={{ color: '#8890A8', fontSize: 13 }}>币</Typography>
          </InputAdornment>,
        }}
        helperText={user ? `可用余额: ${user.coins} 币` : ''}
        FormHelperTextProps={{ sx: { color: '#8890A8', fontSize: 12 } }}
        sx={{
          mt: 2.5, mb: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0F1119',
            '& fieldset': { borderColor: '#2A2F45' },
            '&:hover fieldset': { borderColor: '#C8A951' },
          },
        }}
      />

      {/* Potential win */}
      {selectedTeamId && amount > 0 && (
        <Alert icon={false} severity="success" sx={{
          mb: 1, bgcolor: 'rgba(76,175,80,0.08)', color: '#4CAF50',
          fontWeight: 600, fontSize: 14, borderRadius: 2,
        }}>
          若获胜将获得 <strong style={{ color: '#C8A951' }}>{potentialWin} 币</strong>（含本金）
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, bgcolor: 'rgba(211,47,47,0.08)', color: '#EF5350', borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button onClick={onClose} disabled={loading}
          sx={{ color: '#8890A8', fontSize: 14 }}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedTeamId || amount < MIN_BET_AMOUNT}
          sx={{
            bgcolor: '#D32F2F', color: '#FFF', fontWeight: 700, fontSize: 14, px: 3,
            '&:hover': { bgcolor: '#B71C1C' },
            '&.Mui-disabled': { opacity: 0.5 },
          }}
        >
          {loading ? '投注中...' : `确认投注 ${amount} 币`}
        </Button>
      </Box>
    </Box>
  );
}
