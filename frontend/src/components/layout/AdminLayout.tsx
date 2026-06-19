import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, AppBar, IconButton,
} from '@mui/material';
import { Dashboard, Event, Groups, SportsEsports, AttachMoney, People, Menu, Close } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 220;

const menuItems = [
  { path: '/admin', label: '数据看板', icon: <Dashboard /> },
  { path: '/admin/seasons', label: '赛季管理', icon: <Event /> },
  { path: '/admin/teams', label: '队伍管理', icon: <Groups /> },
  { path: '/admin/matches', label: '比赛管理', icon: <SportsEsports /> },
  { path: '/admin/odds', label: '赔率管理', icon: <AttachMoney /> },
  { path: '/admin/users', label: '用户管理', icon: <People /> },
];

function AdminSidebar({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #C8A951, #B8942E)',
            borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#0F1119',
          }}>竞</Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#C8A951' }}>王者竞猜</Typography>
        </Box>
      </Toolbar>
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 10, color: '#3A3F58', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>主菜单</Box>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton key={item.path} selected={active}
              onClick={() => { navigate(item.path); onNavigate(); }}
              sx={{
                borderRadius: 1.5, mb: 0.3, py: 1.2,
                color: active ? '#C8A951' : '#6B7394',
                bgcolor: active ? '#1F2342' : 'transparent',
                border: active ? '1px solid rgba(200,169,81,0.12)' : '1px solid transparent',
                '&:hover': { bgcolor: '#1A1D2E', color: '#CBD0E0' },
                '&.Mui-selected': { bgcolor: '#1F2342' },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#C8A951' : '#6B7394', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0E17' }}>
      {/* Top AppBar */}
      <AppBar position="fixed" elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#0F1119', borderBottom: '1px solid #1E2340',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, color: '#CBD0E0' }}
            >
              <Menu />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 16 } }}>🏆 管理后台</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" sx={{ color: '#6B7394', display: { xs: 'none', sm: 'block' } }}>{user?.username}</Typography>
            <Box sx={{
              px: 1.5, py: 0.4, borderRadius: 1, fontSize: { xs: 10, sm: 11 }, fontWeight: 700,
              bgcolor: 'rgba(200,169,81,0.1)', color: '#C8A951', border: '1px solid rgba(200,169,81,0.2)',
            }}>ADMIN</Box>
            <Typography variant="body2" onClick={() => { logout(); navigate('/'); }}
              sx={{ color: '#6B7394', cursor: 'pointer', textDecoration: 'underline', fontSize: { xs: 11, sm: 13 }, whiteSpace: 'nowrap' }}
            >退出</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop permanent drawer */}
      <Drawer variant="permanent" sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH, boxSizing: 'border-box',
          bgcolor: '#0F1119', borderRight: '1px solid #1E2340',
        },
      }}>
        <AdminSidebar onNavigate={() => {}} />
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' } }}
        PaperProps={{ sx: { bgcolor: '#0F1119', width: DRAWER_WIDTH } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#6B7394' }}>
            <Close />
          </IconButton>
        </Box>
        <AdminSidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Right Content */}
      <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: '#0B0E17' }}>
        <Toolbar />
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
