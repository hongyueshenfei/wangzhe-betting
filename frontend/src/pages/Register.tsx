import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment } from '@mui/material';
import { Person, Phone, Lock, LockOutlined } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请填写真实姓名和密码');
      return;
    }
    if (!phone) {
      setError('请填写手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('手机号格式不正确，请填写 11 位大陆手机号');
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
      const result = await register({
        username: username.trim(),
        password,
        realName: username.trim(),
        phone: phone.trim(),
      });
      doLogin(result.token, result.user);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || '注册失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#1A1D2E',
          borderRadius: 3,
          border: '1px solid #242840',
          p: { xs: 3, sm: 4 },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#E8EAF0', mb: 0.5 }}
          >
            创建账号
          </Typography>
          <Typography variant="body2" sx={{ color: '#8890A8' }}>
            注册即送 <Box component="span" sx={{ color: '#C8A951', fontWeight: 700 }}>100</Box> 投注币
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Real Name */}
          <TextField
            label="真实姓名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            fullWidth
            required
            placeholder="请输入您的真实姓名"
            helperText="请使用真实姓名，用于核对身份及发放奖金"
            InputLabelProps={{ shrink: true, sx: { color: '#8890A8' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#8890A8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={textFieldSx}
          />

          {/* Phone */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              fullWidth
              required
              placeholder="请输入 11 位手机号"
              InputLabelProps={{ shrink: true, sx: { color: '#8890A8' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: '#8890A8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Box>

          {/* Password */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="new-password"
              placeholder="至少 6 位密码"
              helperText="至少 6 位"
              InputLabelProps={{ shrink: true, sx: { color: '#8890A8' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#8890A8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Box>

          {/* Confirm Password */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              placeholder="再次输入密码"
              InputLabelProps={{ shrink: true, sx: { color: '#8890A8' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#8890A8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2.5,
                bgcolor: 'rgba(211,47,47,0.08)',
                color: '#EF5350',
                fontSize: 13,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: '#C8A951',
              color: '#0F1119',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 2,
              '&:hover': { bgcolor: '#B8942E' },
              '&.Mui-disabled': {
                bgcolor: '#2A2F45',
                color: '#8890A8',
              },
            }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </Box>

        {/* Footer */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: 'center',
            color: '#8890A8',
            fontSize: 13,
          }}
        >
          已有账号？
          <RouterLink
            to="/login"
            style={{
              color: '#C8A951',
              textDecoration: 'none',
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            去登录
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  );
}

/** Shared text field dark theme styles */
const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#0F1119',
    '& fieldset': { borderColor: '#2A2F45' },
    '&:hover fieldset': { borderColor: '#3A3F58' },
    '&.Mui-focused fieldset': { borderColor: '#C8A951', borderWidth: 2 },
  },
  '& .MuiInputBase-input': { color: '#E8EAF0' },
  '& .MuiInputBase-input::placeholder': { color: '#555B70' },
  '& .MuiFormHelperText-root': { color: '#8890A8', mt: 0.5, fontSize: 12 },
};
