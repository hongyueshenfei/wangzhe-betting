import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, Alert, Divider } from '@mui/material';
import { getMe } from '../api/auth';
import { checkin } from '../api/checkin';
import { useAuth } from '../hooks/useAuth';
import CoinDisplay from '../components/common/CoinDisplay';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import type { User } from '../types';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMe();
        setProfile(data);
        setUser(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setUser]);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    setCheckinMsg('');
    try {
      const result = await checkin();
      setCheckinMsg(`签到成功！获得 ${result.earned} 币，当前余额: ${result.newBalance} 币`);
      if (profile) {
        setProfile({ ...profile, coins: result.newBalance, canCheckIn: false });
        setUser({ ...profile, coins: result.newBalance, canCheckIn: false });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '签到失败';
      setCheckinMsg(msg);
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg('');
    if (newPassword.length < 6) {
      setPassMsg('密码长度不能少于 6 位');
      return;
    }
    try {
      const { updateMyProfile } = await import('../api/auth');
      // Use the users service via a direct API call
      const client = (await import('../api/client')).default;
      await client.put('/users/me', { password: newPassword });
      setPassMsg('密码修改成功');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '修改失败';
      setPassMsg(msg);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return null;

  return (
    <Box sx={{ maxWidth: '42rem', mx: 'auto' }}>
      <PageHeader title="个人信息" />

      {/* Basic info */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#E8EAF0' }}>
          基本信息
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7394' }}>
              用户名
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#E8EAF0' }}>
              {profile.username}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7394' }}>
              角色
            </Typography>
            <Typography variant="body1" sx={{ color: '#E8EAF0' }}>
              {profile.role === 'ADMIN' ? '管理员' : '投注人'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7394' }}>
              余额
            </Typography>
            <CoinDisplay coins={profile.coins} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7394' }}>
              注册时间
            </Typography>
            <Typography variant="body1" sx={{ color: '#E8EAF0' }}>
              {new Date(profile.createdAt).toLocaleDateString('zh-CN')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Check-in */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#E8EAF0' }}>
          每日签到
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7394', mb: 1.5 }}>
          每天签到可获得 5 投注币奖励
        </Typography>
        <Button
          variant="contained"
          onClick={handleCheckin}
          disabled={checkinLoading || !profile.canCheckIn}
          sx={{
            bgcolor: '#C8A951',
            color: '#0F1119',
            fontWeight: 700,
            '&:hover': { bgcolor: '#B8942E' },
            '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
          }}
        >
          {checkinLoading
            ? '签到中...'
            : profile.canCheckIn
              ? '🎁 每日签到 (+5币)'
              : '今日已签到'}
        </Button>
        {checkinMsg && (
          <Alert
            severity={checkinMsg.includes('成功') ? 'success' : 'warning'}
            sx={{
              mt: 1.5,
              bgcolor: checkinMsg.includes('成功')
                ? 'rgba(46,125,50,0.1)'
                : 'rgba(237,108,2,0.1)',
              color: checkinMsg.includes('成功') ? '#66BB6A' : '#FFA726',
            }}
          >
            {checkinMsg}
          </Alert>
        )}
      </Paper>

      {/* Change password */}
      <Paper
        sx={{
          p: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#E8EAF0' }}>
          修改密码
        </Typography>
        <TextField
          label="新密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
        <Button
          variant="contained"
          onClick={handleChangePassword}
          sx={{
            mt: 1.5,
            bgcolor: '#C8A951',
            color: '#0F1119',
            fontWeight: 700,
            '&:hover': { bgcolor: '#B8942E' },
            '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
          }}
          disabled={!newPassword}
        >
          修改密码
        </Button>
        {passMsg && (
          <Alert
            severity={passMsg.includes('成功') ? 'success' : 'error'}
            sx={{
              mt: 1.5,
              bgcolor: passMsg.includes('成功')
                ? 'rgba(46,125,50,0.1)'
                : 'rgba(211,47,47,0.1)',
              color: passMsg.includes('成功') ? '#66BB6A' : '#EF5350',
            }}
          >
            {passMsg}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
