import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('请输入用户名和密码'); return; }
    setLoading(true); setError('');
    try {
      const result = await login({ username, password });
      doLogin(result.token, result.user);
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.message || '登录失败');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ maxWidth: 380, mx: 'auto', mt: 8, bgcolor: '#0F1119' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{
          width: 64, height: 64, mx: 'auto', mb: 2,
          background: 'linear-gradient(135deg, #C8A951, #D4A843)', borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: '#0F1119',
          boxShadow: '0 8px 30px rgba(200,169,81,0.2)',
        }}>竞</Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#E8EAF0' }}>欢迎回来</Typography>
        <Typography variant="body2" sx={{ color: '#6B7394', mt: 0.5 }}>登录你的账户参与竞猜</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{
        bgcolor: '#1A1D2E', borderRadius: 3, p: 3, border: '1px solid #1E2340',
      }}>
        <TextField
          label="用户名" value={username} onChange={e => setUsername(e.target.value)}
          fullWidth margin="normal" autoFocus
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          FormHelperTextProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119', borderRadius: 1.5,
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0' },
          }}
        />
        <TextField
          label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)}
          fullWidth margin="normal"
          InputLabelProps={{ sx: { color: '#6B7394' } }}
          FormHelperTextProps={{ sx: { color: '#6B7394' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119', borderRadius: 1.5,
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            input: { color: '#E8EAF0' },
          }}
        />
        <Button type="submit" fullWidth disabled={loading} sx={{
          mt: 3, py: 1.5, borderRadius: 1.5, fontWeight: 700, fontSize: 15,
          background: 'linear-gradient(135deg, #C8A951, #B8942E)', color: '#0F1119',
          '&:hover': { background: 'linear-gradient(135deg, #B8942E, #A07D1A)' },
          '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
        }}>
          {loading ? '登录中...' : '登 录'}
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#6B7394' }}>
            还没有账户？<RouterLink to="/register" style={{ color: '#C8A951', textDecoration: 'none' }}>立即注册</RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
