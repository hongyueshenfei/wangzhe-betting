import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';

interface SeasonFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: { name?: string; startDate?: string; endDate?: string };
  onClose: () => void;
  onSubmit: (data: { name: string; startDate: string; endDate: string }) => Promise<void>;
}

export default function SeasonFormDialog({
  open,
  mode,
  initialData = {},
  onClose,
  onSubmit,
}: SeasonFormDialogProps) {
  const [name, setName] = useState(initialData.name || '');
  const [startDate, setStartDate] = useState(
    initialData.startDate
      ? initialData.startDate.slice(0, 10)
      : '',
  );
  const [endDate, setEndDate] = useState(
    initialData.endDate
      ? initialData.endDate.slice(0, 10)
      : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      setError('请填写所有必填字段');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name, startDate, endDate });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
          color: '#E8EAF0',
        },
      }}
    >
      <DialogTitle sx={{ color: '#E8EAF0', fontWeight: 700 }}>
        {mode === 'create' ? '创建赛季' : '编辑赛季'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="赛季名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="如: S1 春季赛"
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0' },
          }}
        />
        <TextField
          label="开始日期"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true, sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0', colorScheme: 'dark' },
          }}
        />
        <TextField
          label="结束日期"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true, sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0', colorScheme: 'dark' },
          }}
        />
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 1, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#8890A8' }}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#C8A951',
            color: '#0F1119',
            fontWeight: 700,
            '&:hover': { bgcolor: '#B8942E' },
            '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
          }}
        >
          {loading ? '提交中...' : mode === 'create' ? '创建' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
