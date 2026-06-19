import { Box, Typography, CircularProgress } from '@mui/material';

interface LoadingProps { text?: string; }

export default function Loading({ text = '加载中...' }: LoadingProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
      <CircularProgress sx={{ color: '#C8A951' }} />
      <Typography variant="body2" sx={{ color: '#6B7394' }}>{text}</Typography>
    </Box>
  );
}
