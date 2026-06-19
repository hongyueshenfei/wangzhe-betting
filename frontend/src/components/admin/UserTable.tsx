import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Block, CheckCircle, AttachMoney, LockReset } from '@mui/icons-material';
import type { User } from '../../types';
import { formatDateTime, formatCoins } from '../../utils/format';

interface UserTableProps {
  users: User[];
  onBan: (userId: number) => void;
  onUnban: (userId: number) => void;
  onAdjustCoins: (userId: number, username: string) => void;
  onResetPassword: (userId: number, username: string) => void;
}

export default function UserTable({
  users,
  onBan,
  onUnban,
  onAdjustCoins,
  onResetPassword,
}: UserTableProps) {
  return (
    <TableContainer component={Paper} sx={{ bgcolor: '#1A1D2E', border: '1px solid #242840' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>ID</TableCell>
            <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>用户名</TableCell>
            <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>角色</TableCell>
            <TableCell align="right" sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>余额</TableCell>
            <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>状态</TableCell>
            <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>注册时间</TableCell>
            <TableCell align="center" sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340' }}>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell sx={{ color: '#8890A8', borderColor: '#151827' }}>{user.id}</TableCell>
              <TableCell sx={{ color: '#E8EAF0', fontWeight: 600, borderColor: '#151827' }}>
                {user.username}
              </TableCell>
              <TableCell sx={{ borderColor: '#151827' }}>
                <Chip
                  label={user.role === 'ADMIN' ? '管理员' : '投注人'}
                  size="small"
                  sx={{
                    bgcolor: user.role === 'ADMIN' ? 'rgba(200,169,81,0.1)' : 'rgba(66,165,245,0.1)',
                    color: user.role === 'ADMIN' ? '#C8A951' : '#42A5F5',
                    fontSize: 10, fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="right" sx={{ color: '#E8EAF0', borderColor: '#151827', fontWeight: 600 }}>
                {formatCoins(user.coins)}
              </TableCell>
              <TableCell sx={{ borderColor: '#151827' }}>
                <Chip
                  label={user.isBanned ? '已封禁' : '正常'}
                  size="small"
                  sx={{
                    bgcolor: user.isBanned ? 'rgba(211,47,47,0.1)' : 'rgba(76,175,80,0.1)',
                    color: user.isBanned ? '#EF5350' : '#4CAF50',
                    fontSize: 10, fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: '#8890A8', fontSize: 12, borderColor: '#151827' }}>
                {formatDateTime(user.createdAt)}
              </TableCell>
              <TableCell align="center" sx={{ borderColor: '#151827' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <Tooltip title="重置密码">
                    <IconButton size="small"
                      onClick={() => onResetPassword(user.id, user.username)}
                      sx={{ color: '#42A5F5' }}>
                      <LockReset fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="调整余额">
                    <IconButton size="small"
                      onClick={() => onAdjustCoins(user.id, user.username)}
                      sx={{ color: '#66BB6A' }}>
                      <AttachMoney fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {user.isBanned ? (
                    <Tooltip title="解封">
                      <IconButton size="small"
                        onClick={() => onUnban(user.id)}
                        disabled={user.role === 'ADMIN'}
                        sx={{ color: '#4CAF50' }}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="封禁">
                      <IconButton size="small"
                        onClick={() => onBan(user.id)}
                        disabled={user.role === 'ADMIN'}
                        sx={{ color: '#EF5350' }}>
                        <Block fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
