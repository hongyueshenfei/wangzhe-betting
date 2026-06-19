import { Box, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MATCH_STATUS_LABELS, MATCH_STAGE_LABELS } from '../../utils/constants';

interface MatchFilterProps {
  stage: string;
  status: string;
  onStageChange: (stage: string) => void;
  onStatusChange: (status: string) => void;
}

export default function MatchFilter({
  stage,
  status,
  onStageChange,
  onStatusChange,
}: MatchFilterProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 3 }}>
      {/* Stage filter */}
      <ToggleButtonGroup
        value={stage}
        exclusive
        onChange={(_, val) => onStageChange(val || '')}
        size="small"
        sx={{
          width: { xs: '100%', sm: 'auto' },
          '& .MuiToggleButton-root': {
            flex: { xs: 1, sm: 'none' },
            color: '#8890A8',
            borderColor: '#2A2F45',
            fontSize: { xs: 11, sm: 12 },
            px: { xs: 1, sm: 1.5 },
            '&.Mui-selected': {
              color: '#C8A951',
              bgcolor: 'rgba(200,169,81,0.1)',
              borderColor: '#C8A951',
            },
            '&:hover': { bgcolor: 'rgba(200,169,81,0.05)' },
          },
        }}
      >
        <ToggleButton value="">全部</ToggleButton>
        {Object.entries(MATCH_STAGE_LABELS).map(([key, label]) => (
          <ToggleButton key={key} value={key}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Status filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: { xs: '100%', sm: 140 },
          '& .MuiInputLabel-root': { color: '#6B7394' },
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0F1119',
            color: '#E8EAF0',
            '& fieldset': { borderColor: '#2A2F45' },
            '&:hover fieldset': { borderColor: '#3A3F58' },
            '&.Mui-focused fieldset': { borderColor: '#C8A951' },
          },
          '& .MuiSvgIcon-root': { color: '#8890A8' },
        }}
      >
        <InputLabel>状态</InputLabel>
        <Select
          value={status}
          label="状态"
          onChange={(e) => onStatusChange(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#1A1D2E',
                border: '1px solid #1E2340',
                '& .MuiMenuItem-root': {
                  color: '#E8EAF0',
                  '&:hover': { bgcolor: '#242840' },
                },
              },
            },
          }}
        >
          <MenuItem value="">全部状态</MenuItem>
          {Object.entries(MATCH_STATUS_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
