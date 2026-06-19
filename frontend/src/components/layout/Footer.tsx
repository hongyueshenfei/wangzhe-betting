import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ py: 2, textAlign: 'center', borderTop: '1px solid #1E2340', bgcolor: '#0F1119' }}>
      <Typography variant="body2" sx={{ color: '#3A3F58', fontSize: 12 }}>
        王者荣耀竞猜平台 · 仅供娱乐
      </Typography>
    </Box>
  );
}
