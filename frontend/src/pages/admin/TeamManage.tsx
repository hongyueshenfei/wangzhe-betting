import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  TextField,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { createTeam, updateTeam, deleteTeam } from '../../api/admin';
import { getTeamList } from '../../api/teams';
import { getSeasonList } from '../../api/seasons';
import TeamFormDialog from '../../components/admin/TeamFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import type { Team, Season, TeamMemberPositions } from '../../types';

/** Safely parse members JSON string into TeamMemberPositions */
function parseMemberPositions(members: string | null): TeamMemberPositions {
  if (!members) return {};
  try {
    const parsed = JSON.parse(members);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Format member positions for display in table */
function formatMembersDisplay(members: string | null): string {
  const positions = parseMemberPositions(members);
  const names = [
    positions.topLaner,
    positions.midLaner,
    positions.adc,
    positions.support,
    positions.jungler,
    positions.substitute,
  ].filter(Boolean);
  return names.length > 0 ? names.join('、') : '-';
}

export default function TeamManage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState('');
  const limit = 20;

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Batch import
  const [importText, setImportText] = useState('');

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamList({ page, limit });
      setTeams(data.list);
      setTotal(data.total);
    } catch {
      setError('加载战队列表失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTeams();
    getSeasonList({ limit: 50 }).then((d) => setSeasons(d.list)).catch(() => {});
  }, [loadTeams]);

  const handleCreate = async (data: {
    name: string;
    description?: string;
    seasonId?: number;
    logoUrl?: string;
    posterUrl?: string;
    memberPositions?: TeamMemberPositions;
  }) => {
    await createTeam(data);
    setMsg('战队创建成功');
    loadTeams();
  };

  const handleUpdate = async (data: {
    name?: string;
    description?: string;
    seasonId?: number;
    logoUrl?: string;
    posterUrl?: string;
    memberPositions?: TeamMemberPositions;
  }) => {
    if (!editTeam) return;
    await updateTeam(editTeam.id, data);
    setMsg('战队更新成功');
    loadTeams();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTeam(deleteTarget.id);
      setMsg('战队已删除');
      loadTeams();
    } catch (err: unknown) {
      const msgErr = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '删除失败';
      setError(msgErr);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleBatchImport = async () => {
    if (!importText.trim()) {
      setError('请输入战队列表');
      return;
    }
    const lines = importText.split('\n').filter((l) => l.trim());
    let count = 0;
    for (const line of lines) {
      const parts = line.split(',');
      const name = parts[0]?.trim();
      if (!name) continue;
      try {
        await createTeam({ name });
        count++;
      } catch {
        // skip duplicates
      }
    }
    setMsg(`成功导入 ${count} 支战队`);
    setImportText('');
    loadTeams();
  };

  if (loading && teams.length === 0) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 26, color: '#E8EAF0' }}>
          👥 战队管理
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setDialogMode('create');
            setEditTeam(null);
            setDialogOpen(true);
          }}
          sx={{
            bgcolor: '#C8A951',
            color: '#0F1119',
            fontWeight: 700,
            '&:hover': { bgcolor: '#B8942E' },
          }}
        >
          创建战队
        </Button>
      </Box>

      {msg && (
        <Alert
          severity="success"
          sx={{ mb: 2, bgcolor: 'rgba(46,125,50,0.1)', color: '#66BB6A' }}
          onClose={() => setMsg('')}
        >
          {msg}
        </Alert>
      )}

      {/* Batch import */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#E8EAF0', mb: 1.5 }}>
          批量导入战队
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Button
            onClick={handleBatchImport}
            sx={{
              color: '#8890A8',
              borderColor: '#2A2F45',
              '&:hover': { borderColor: '#C8A951', color: '#C8A951' },
            }}
          >
            导入
          </Button>
        </Box>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="每行一支战队，格式: 战队名"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          InputProps={{ sx: { color: '#E8EAF0' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#8890A8' },
          }}
        />
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Team table */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#1A1D2E',
          border: '1px solid #1E2340',
          overflowX: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { color: '#8890A8', fontWeight: 700 } }}>
              <TableCell>ID</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>海报</TableCell>
              <TableCell>队员</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow
                key={team.id}
                hover
                sx={{
                  '&:hover': { bgcolor: 'rgba(200,169,81,0.04)' },
                  '& .MuiTableCell-body': { color: '#E8EAF0', borderColor: '#1E2340' },
                }}
              >
                <TableCell>{team.id}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#0F1119',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #1E2340',
                    }}
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>🏆</span>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#E8EAF0' }}>
                    {team.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 64,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: '#0F1119',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #1E2340',
                    }}
                  >
                    {team.posterUrl ? (
                      <img
                        src={team.posterUrl}
                        alt={`${team.name} 海报`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: '#8890A8' }}>-</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      color: '#8890A8',
                    }}
                  >
                    {formatMembersDisplay(team.members)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="编辑">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDialogMode('edit');
                          setEditTeam(team);
                          setDialogOpen(true);
                        }}
                        sx={{ color: '#8890A8', '&:hover': { color: '#C8A951' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(team)}
                        sx={{ color: '#EF5350', '&:hover': { color: '#D32F2F' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total > limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': { color: '#8890A8' },
              '& .Mui-selected': { bgcolor: '#C8A951', color: '#0F1119' },
            }}
          />
        </Box>
      )}

      {/* Create/Edit Dialog — key forces remount on team change so initialData is applied */}
      <TeamFormDialog
        key={`${dialogMode}-${editTeam?.id ?? 'new'}`}
        open={dialogOpen}
        mode={dialogMode}
        seasons={seasons}
        initialData={
          editTeam
            ? {
                name: editTeam.name,
                description: editTeam.description || '',
                seasonId: editTeam.seasonId ?? undefined,
                logoUrl: editTeam.logoUrl || '',
                posterUrl: editTeam.posterUrl || '',
                memberPositions: parseMemberPositions(editTeam.members),
              }
            : {}
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={dialogMode === 'create' ? handleCreate : handleUpdate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除战队"
        message={`确定要删除战队「${deleteTarget?.name}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
