import { Box, Typography, IconButton } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function Footer() {
  return (
    <Box sx={{
      py: 2.5, px: 3,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: '1px solid #1E2340', bgcolor: '#0F1119',
      flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#3A3F58', fontSize: 12 }}>
          王者荣耀竞猜平台 · 仅供娱乐
        </Typography>
        <Typography variant="body2" sx={{ color: '#3A3F58', fontSize: 11, display: { xs: 'none', sm: 'block' } }}>
          © {new Date().getFullYear()}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={scrollToTop}
        sx={{
          color: '#3A3F58',
          border: '1px solid #2A2F45',
          borderRadius: 1,
          '&:hover': { color: '#C8A951', borderColor: '#C8A951' },
        }}
        aria-label="回到顶部"
      >
        <KeyboardArrowUp fontSize="small" />
      </IconButton>
    </Box>
  );
}
