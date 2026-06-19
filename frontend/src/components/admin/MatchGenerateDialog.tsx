import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import type { Season } from '../../types';

interface MatchGenerateDialogProps {
  open: boolean;
  seasons: Season[];
  onClose: () => void;
  onGenerate: (seasonId: number, groups: string[]) => Promise<void>;
}

export default function MatchGenerateDialog({
  open,
  seasons,
  onClose,
  onGenerate,
}: MatchGenerateDialogProps) {
  const [seasonId, setSeasonId] = useState<number | ''>('');
  const [groupsInput, setGroupsInput] = useState('A组, B组');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = groupsInput
    .split(/[,，]/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);

  const handleSubmit = async () => {
    if (seasonId === '' || groups.length === 0) {
      setError('请选择赛季并输入至少一个小组');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onGenerate(seasonId as number, groups);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '生成失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>生成小组赛赛程</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>选择赛季</InputLabel>
          <Select
            value={seasonId}
            label="选择赛季"
            onChange={(e) => setSeasonId(Number(e.target.value))}
          >
            {seasons.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} ({s.status})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="小组列表"
          value={groupsInput}
          onChange={(e) => setGroupsInput(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={2}
          placeholder="用逗号分隔，如: A组, B组, C组, D组"
          helperText="队伍将均匀分配到各小组，每组内进行单循环赛"
        />

        {/* Preview groups */}
        <Box className="flex flex-wrap gap-2 mt-2">
          {groups.map((g) => (
            <Chip key={g} label={g} size="small" variant="outlined" />
          ))}
        </Box>

        {error && (
          <Alert severity="error" className="mt-3">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? '生成中...' : '生成赛程'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
