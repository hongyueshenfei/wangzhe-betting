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
    >
      <DialogTitle sx={{ color: '#E8EAF0', fontWeight: 700 }}>
        {mode === 'create' ? '创建赛季' : '编辑赛季'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          label="赛季名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="如: S1 春季赛"
        />
        <TextField
          label="开始日期"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{ style: { colorScheme: 'dark' } }}
        />
        <TextField
          label="结束日期"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{ style: { colorScheme: 'dark' } }}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? '提交中...' : mode === 'create' ? '创建' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
