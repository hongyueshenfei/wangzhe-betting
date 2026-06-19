import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Chip,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon, Close } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMe } from '../../api/auth';

const NAV_ITEMS = [
  { to: '/matches', label: '比赛' },
  { to: '/teams', label: '战队' },
  { to: '/champion-bet', label: '冠军竞猜' },
  { to: '/leaderboard', label: '排行榜' },
  { to: '/my-bets', label: '我的投注' },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Refresh user data from server on mount (coins may change after operations)
  useEffect(() => {
    if (isAuthenticated) {
      getMe().then((freshUser) => {
        setUser(freshUser);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(180deg, #0F1119, #13151E)',
          borderBottom: '1px solid #1E2340',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2 } }}>
          {/* Mobile hamburger */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { lg: 'none' }, color: '#CBD0E0' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
          >
            <Box
              sx={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, #C8A951, #B8942E)',
                borderRadius: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 900, color: '#0F1119',
              }}
            >竞</Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 16, sm: 18 },
                background: 'linear-gradient(135deg, #C8A951, #E8C97A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              王者竞猜
            </Typography>
          </Box>

          {/* Nav links — desktop */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                sx={{ color: '#CBD0E0', fontSize: 13, fontWeight: 600, '&:hover': { color: '#C8A951' } }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User area */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {isAuthenticated && user ? (
              <>
                <Chip
                  label={`${user.coins} 币`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(200,169,81,0.15), rgba(200,169,81,0.08))',
                    color: '#C8A951',
                    fontWeight: 700,
                    fontSize: { xs: 10, sm: 12 },
                    border: '1px solid rgba(200,169,81,0.2)',
                  }}
                />
                <Typography
                  component={RouterLink}
                  to="/profile"
                  sx={{
                    color: '#CBD0E0', fontSize: { xs: 11, sm: 13 },
                    textDecoration: 'none', display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {user.username}
                </Typography>
                {isAdmin && (
                  <Button component={RouterLink} to="/admin" size="small"
                    sx={{ color: '#C8A951', borderColor: 'rgba(200,169,81,0.3)', fontSize: { xs: 10, sm: 12 }, px: { xs: 1, sm: 1.5 } }}
                    variant="outlined"
                  >管理</Button>
                )}
                <Button onClick={handleLogout} sx={{
                  color: '#8890A8', fontSize: { xs: 10, sm: 12 },
                  minWidth: 'auto', px: { xs: 0.5, sm: 1 },
                }}>退出</Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink} to="/login"
                  sx={{ color: '#C8A951', fontWeight: 600, fontSize: { xs: 12, sm: 14 }, minWidth: 'auto', px: { xs: 1, sm: 2 } }}
                >登录</Button>
                <Button component={RouterLink} to="/register" variant="outlined"
                  sx={{ color: '#CBD0E0', borderColor: '#3A3F58', fontSize: { xs: 12, sm: 13 }, minWidth: 'auto', px: { xs: 1, sm: 2 } }}
                >注册</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: '#0F1119', color: '#E8EAF0', width: 260, pt: 2 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1 }}>
          <Typography sx={{ fontWeight: 800, color: '#C8A951', fontSize: 18 }}>王者竞猜</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#8890A8' }}>
            <Close />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#1E2340' }} />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                sx={{ color: '#CBD0E0', '&:hover': { bgcolor: 'rgba(200,169,81,0.08)' } }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {isAuthenticated && isAdmin && (
          <>
            <Divider sx={{ borderColor: '#1E2340', my: 1 }} />
            <ListItemButton
              component={RouterLink}
              to="/admin"
              onClick={() => setDrawerOpen(false)}
              sx={{ color: '#C8A951', mx: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(200,169,81,0.1)' } }}
            >
              <ListItemText primary="管理后台" primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            </ListItemButton>
          </>
        )}
      </Drawer>
    </>
  );
}
