import { Paper, Typography, Box } from '@mui/material';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function AdminStatCard({
  title,
  value,
  subtitle,
  color = '#1976d2',
  icon,
}: AdminStatCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: '#1A1D2E',
        border: '1px solid #1E2340',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              bgcolor: color,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="body2" sx={{ color: '#6B7394' }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#6B7394' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
