import { useState, useRef } from 'react';
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
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { uploadFile } from '../../api/admin';
import type { Season, TeamMemberPositions } from '../../types';

interface TeamFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  seasons: Season[];
  initialData?: {
    name?: string;
    description?: string;
    seasonId?: number;
    logoUrl?: string;
    posterUrl?: string;
    memberPositions?: TeamMemberPositions;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    seasonId?: number;
    logoUrl?: string;
    posterUrl?: string;
    memberPositions?: TeamMemberPositions;
  }) => Promise<void>;
}

/** Position labels for display */
const POSITION_LABELS: Record<keyof TeamMemberPositions, string> = {
  topLaner: '上单',
  midLaner: '中单',
  adc: '射手',
  support: '游走',
  jungler: '打野',
  substitute: '替补',
};

const POSITION_KEYS: (keyof TeamMemberPositions)[] = [
  'topLaner',
  'midLaner',
  'adc',
  'support',
  'jungler',
  'substitute',
];

export default function TeamFormDialog({
  open,
  mode,
  seasons,
  initialData = {},
  onClose,
  onSubmit,
}: TeamFormDialogProps) {
  // Basic info
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [seasonId, setSeasonId] = useState<number | ''>(initialData.seasonId ?? '');

  // Media URLs
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');
  const [posterUrl, setPosterUrl] = useState(initialData.posterUrl || '');

  // Member positions
  const [memberPositions, setMemberPositions] = useState<TeamMemberPositions>(
    initialData.memberPositions || {},
  );

  // Upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Handle file upload */
  const handleUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file);
      setUrl(result.url);
    } catch {
      setError('文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  /** Handle logo file selection */
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, setLogoUrl, setLogoUploading);
    }
    // Reset input so same file can be re-selected
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  /** Handle poster file selection */
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, setPosterUrl, setPosterUploading);
    }
    if (posterInputRef.current) posterInputRef.current.value = '';
  };

  /** Update a single member position */
  const handlePositionChange = (key: keyof TeamMemberPositions, value: string) => {
    setMemberPositions((prev) => ({ ...prev, [key]: value || undefined }));
  };

  /** Check if memberPositions has any non-empty values */
  const hasMemberPositions = (): boolean => {
    return POSITION_KEYS.some((key) => memberPositions[key]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请填写战队名称');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        seasonId: seasonId !== '' ? (seasonId as number) : undefined,
        logoUrl: logoUrl || undefined,
        posterUrl: posterUrl || undefined,
        memberPositions: hasMemberPositions() ? memberPositions : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || '操作失败';
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
        {mode === 'create' ? '创建战队' : '编辑战队'}
      </DialogTitle>
      <DialogContent>
        {/* ── Basic Info ─────────────────────────── */}
        <TextField
          label="战队名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
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

        {mode === 'create' && (
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#6B7394' }}>所属赛季</InputLabel>
            <Select
              value={seasonId}
              label="所属赛季"
              onChange={(e) => setSeasonId(e.target.value === '' ? '' : Number(e.target.value))}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#1A1D2E',
                    border: '1px solid #1E2340',
                    '& .MuiMenuItem-root': { color: '#E8EAF0', '&:hover': { bgcolor: '#242840' } },
                  },
                },
              }}
              sx={{
                bgcolor: '#0F1119',
                color: '#E8EAF0',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2F45' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3A3F58' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C8A951' },
                '& .MuiSvgIcon-root': { color: '#8890A8' },
              }}
            >
              <MenuItem value="">
                <em>不限</em>
              </MenuItem>
              {seasons.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          label="战队简介"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={2}
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            textarea: { color: '#E8EAF0' },
          }}
        />

        {/* ── Logo Upload ────────────────────────── */}
        <Divider sx={{ my: 1.5, borderColor: '#1E2340' }} />
        <Typography variant="subtitle2" sx={{ color: '#E8EAF0', mb: 1 }}>
          Logo 上传
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="team-logo-upload"
            onChange={handleLogoFileChange}
          />
          <label htmlFor="team-logo-upload">
            <Button
              component="span"
              startIcon={<CloudUpload />}
              disabled={logoUploading}
              sx={{
                color: '#8890A8',
                borderColor: '#2A2F45',
                '&:hover': { borderColor: '#C8A951', color: '#C8A951' },
              }}
            >
              {logoUploading ? '上传中...' : '上传 Logo'}
            </Button>
          </label>
          {logoUrl && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                border: '1px solid #2A2F45',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={logoUrl}
                alt="Logo 预览"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>
        <TextField
          label="Logo URL"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
          placeholder="上传后自动填入，或手动输入 URL"
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0' },
            '& .MuiInputBase-input::placeholder': { color: '#6B7394' },
          }}
        />

        {/* ── Poster Upload ──────────────────────── */}
        <Divider sx={{ my: 1.5, borderColor: '#1E2340' }} />
        <Typography variant="subtitle2" sx={{ color: '#E8EAF0', mb: 1 }}>
          战队海报
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <input
            ref={posterInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="team-poster-upload"
            onChange={handlePosterFileChange}
          />
          <label htmlFor="team-poster-upload">
            <Button
              component="span"
              startIcon={<CloudUpload />}
              disabled={posterUploading}
              sx={{
                color: '#8890A8',
                borderColor: '#2A2F45',
                '&:hover': { borderColor: '#C8A951', color: '#C8A951' },
              }}
            >
              {posterUploading ? '上传中...' : '上传海报'}
            </Button>
          </label>
          {posterUrl && (
            <Box
              sx={{
                width: 96,
                height: 56,
                borderRadius: 1,
                border: '1px solid #2A2F45',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={posterUrl}
                alt="海报 预览"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>
        <TextField
          label="海报 URL"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
          placeholder="上传后自动填入，或手动输入 URL"
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0' },
            '& .MuiInputBase-input::placeholder': { color: '#6B7394' },
          }}
        />

        {/* ── Member Positions ───────────────────── */}
        <Divider sx={{ my: 1.5, borderColor: '#1E2340' }} />
        <Typography variant="subtitle2" sx={{ color: '#E8EAF0', mb: 1 }}>
          成员配置
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {POSITION_KEYS.map((key) => (
            <TextField
              key={key}
              label={POSITION_LABELS[key]}
              value={memberPositions[key] || ''}
              onChange={(e) => handlePositionChange(key, e.target.value)}
              size="small"
              placeholder={`输入${POSITION_LABELS[key]}选手`}
              InputLabelProps={{ sx: { color: '#6B7394' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0F1119',
                  '& fieldset': { borderColor: '#2A2F45' },
                  '&:hover fieldset': { borderColor: '#3A3F58' },
                  '&.Mui-focused fieldset': { borderColor: '#C8A951' },
                },
                input: { color: '#E8EAF0' },
                '& .MuiInputBase-input::placeholder': { color: '#6B7394' },
              }}
            />
          ))}
        </Box>

        {/* ── Error ──────────────────────────────── */}
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 1.5, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}
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
