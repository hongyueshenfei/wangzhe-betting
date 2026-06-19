import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/common/PageHeader';

export default function Register() {
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请填写所有字段');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度不能少于 6 位');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await register({ username, password });
      doLogin(result.token, result.user);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '注册失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 448, mx: 'auto', mt: 8 }}>
      <PageHeader title="注册" subtitle="创建新账号，初始获得 100 投注币" />
      <Paper
        sx={{
          p: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            helperText="2-20 个字符"
            InputLabelProps={{ sx: { color: '#6B7394' } }}
            FormHelperTextProps={{ sx: { color: '#6B7394' } }}
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
          <TextField
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            helperText="至少 6 位"
            InputLabelProps={{ sx: { color: '#6B7394' } }}
            FormHelperTextProps={{ sx: { color: '#6B7394' } }}
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
          <TextField
            label="确认密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
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
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                bgcolor: 'rgba(211,47,47,0.1)',
                color: '#EF5350',
              }}
            >
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: '#C8A951',
              color: '#0F1119',
              fontWeight: 700,
              '&:hover': { bgcolor: '#B8942E' },
              '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
            }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#6B7394' }}>
          已有账号？{' '}
          <RouterLink to="/login" style={{ color: '#C8A951', textDecoration: 'none' }}>
            去登录
          </RouterLink>
        </Typography>
      </Paper>
    </Box>
  );
}
