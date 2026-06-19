import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import FadeIn from '../common/FadeIn';

export default function BettorLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0B0E17' }}>
      <Navbar />
      <Box sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <FadeIn><Outlet /></FadeIn>
      </Box>
    </Box>
  );
}
