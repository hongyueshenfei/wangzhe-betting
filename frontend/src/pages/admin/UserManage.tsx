import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from '@mui/material';
import { getAdminUsers, banUser, unbanUser, adjustCoins, resetPassword, batchCreateUsers } from '../../api/admin';
import UserTable from '../../components/admin/UserTable';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import type { User } from '../../types';

export default function UserManage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  // Adjust coins dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<{ id: number; username: string } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Reset password dialog
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<{ id: number; username: string } | null>(null);
  const [pwdNew, setPwdNew] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Batch import dialog
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({
        page,
        limit,
        keyword: keyword || undefined,
      });
      setUsers(data.list);
      setTotal(data.total);
    } catch {
      setError('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleBan = async (userId: number) => {
    try {
      await banUser(userId);
      setMsg('用户已封禁');
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败';
      setError(msg);
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await unbanUser(userId);
      setMsg('用户已解封');
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败';
      setError(msg);
    }
  };

  const handleAdjustCoinsOpen = (userId: number, username: string) => {
    setAdjustTarget({ id: userId, username });
    setAdjustAmount(0);
    setAdjustReason('');
    setAdjustOpen(true);
  };

  const handleAdjustCoins = async () => {
    if (!adjustTarget) return;
    setAdjustLoading(true);
    try {
      await adjustCoins(adjustTarget.id, adjustAmount, adjustReason || undefined);
      setMsg(`已为 ${adjustTarget.username} 调整余额 ${adjustAmount > 0 ? '+' : ''}${adjustAmount} 币`);
      setAdjustOpen(false);
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败';
      setError(msg);
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleResetPwdOpen = (userId: number, username: string) => {
    setPwdTarget({ id: userId, username });
    setPwdNew('');
    setPwdOpen(true);
  };

  const handleResetPwd = async () => {
    if (!pwdTarget || !pwdNew || pwdNew.length < 6) {
      setError('新密码至少 6 位');
      return;
    }
    setPwdLoading(true);
    try {
      await resetPassword(pwdTarget.id, pwdNew);
      setMsg(`已为 ${pwdTarget.username} 重置密码`);
      setPwdOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败';
      setError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleBatchCreate = async () => {
    if (!batchText.trim()) return;
    const lines = batchText.trim().split('\n').filter(Boolean);
    const users = lines.map(line => {
      const [username, password, coins] = line.split(/[,;\t\s]+/);
      return { username: username?.trim(), password: password?.trim() || '123456', initialCoins: coins ? parseInt(coins) : 100 };
    }).filter(u => u.username);
    
    if (users.length === 0) {
      setError('请按格式输入：用户名,密码,初始币数');
      return;
    }
    
    setBatchLoading(true);
    try {
      const result = await batchCreateUsers(users);
      setMsg(`新增 ${result.total} 个用户${result.skipped.length > 0 ? `，跳过重复: ${result.skipped.join(', ')}` : ''}`);
      setBatchOpen(false);
      setBatchText('');
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '批量导入失败';
      setError(msg);
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading && users.length === 0) return <Loading />;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>👤 用户管理</Typography>

      {msg && (
        <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(76,175,80,0.08)', color: '#4CAF50' }} onClose={() => setMsg('')}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211,47,47,0.08)', color: '#EF5350' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          size="small"
          placeholder="搜索用户名..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0' } },
          }}
        />
        <Button variant="outlined" onClick={handleSearch}
          sx={{ borderColor: '#2A2F45', color: '#8890A8', '&:hover': { borderColor: '#C8A951', color: '#C8A951' } }}>
          搜索
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => setBatchOpen(true)}
          sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, fontSize: 13, '&:hover': { bgcolor: '#B8942E' } }}>
          + 批量新增用户
        </Button>
      </Box>

      <UserTable
        users={users}
        onBan={handleBan}
        onUnban={handleUnban}
        onAdjustCoins={handleAdjustCoinsOpen}
        onResetPassword={handleResetPwdOpen}
      />

      {total > limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(_, p) => setPage(p)}
            sx={{ '& .MuiPaginationItem-root': { color: '#8890A8' } }}
          />
        </Box>
      )}

      {/* Adjust Coins Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, fontSize: 16 }}>
          调整余额 - {adjustTarget?.username}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="调整金额"
            type="number"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(Number(e.target.value))}
            fullWidth
            helperText="正数 = 增加，负数 = 减少"
            InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
            FormHelperTextProps={{ sx: { color: '#8890A8' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#8890A8' }}>💰</Typography></InputAdornment>,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0' } },
            }}
          />
          <TextField
            label="备注"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            fullWidth
            placeholder="调整原因（可选）"
            InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0' } },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setAdjustOpen(false)} disabled={adjustLoading} sx={{ color: '#8890A8' }}>取消</Button>
          <Button variant="contained" onClick={handleAdjustCoins}
            disabled={adjustLoading || adjustAmount === 0}
            sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}>
            {adjustLoading ? '处理中...' : '确认调整'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, fontSize: 16 }}>
          重置密码 - {pwdTarget?.username}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#8890A8', mb: 2 }}>
            为用户 <strong style={{ color: '#C8A951' }}>{pwdTarget?.username}</strong> 设置新密码
          </Typography>
          <TextField
            label="新密码"
            type="text"
            value={pwdNew}
            onChange={(e) => setPwdNew(e.target.value)}
            fullWidth
            helperText="至少 6 位字符"
            InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
            FormHelperTextProps={{ sx: { color: '#8890A8' } }}
            inputProps={{ minLength: 6, style: { color: '#E8EAF0', fontSize: 15 } }}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' } },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setPwdOpen(false)} disabled={pwdLoading} sx={{ color: '#8890A8' }}>取消</Button>
          <Button variant="contained" onClick={handleResetPwd}
            disabled={pwdLoading || pwdNew.length < 6}
            sx={{ bgcolor: '#D32F2F', color: '#FFF', fontWeight: 700, '&:hover': { bgcolor: '#B71C1C' } }}>
            {pwdLoading ? '处理中...' : '确认重置'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Create Users Dialog */}
      <Dialog open={batchOpen} onClose={() => setBatchOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, fontSize: 16 }}>
          批量新增用户
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#8890A8', mb: 2 }}>
            每行一个用户，格式：<strong style={{ color: '#C8A951' }}>用户名,密码,初始币数</strong>
            （密码默认 123456，币数默认 100）
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="player1,123456,100&#10;player2,mypass123&#10;player3,pass456,200"
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            inputProps={{ style: { color: '#E8EAF0', fontSize: 14, fontFamily: 'monospace' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0F1119',
                '& fieldset': { borderColor: '#2A2F45' },
                '&:hover fieldset': { borderColor: '#C8A951' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setBatchOpen(false)} disabled={batchLoading} sx={{ color: '#8890A8' }}>取消</Button>
          <Button variant="contained" onClick={handleBatchCreate}
            disabled={batchLoading || !batchText.trim()}
            sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}>
            {batchLoading ? '导入中...' : '确认导入'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
