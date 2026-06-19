import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Paper, IconButton, Chip,
  Select, MenuItem, FormControl, InputLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Grid,
} from '@mui/material';
import { Add, Delete, Edit, ArrowForward } from '@mui/icons-material';
import { getSeasonList } from '../../api/seasons';
import { createSeason, updateSeason } from '../../api/admin';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import type { Season, RoundConfig, RoundType } from '../../types';

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: 'round_robin', label: '循环积分赛' },
  { value: 'knockout', label: '淘汰赛' },
];

const FORMAT_OPTIONS = ['BO1', 'BO3', 'BO5'];

function defaultRound(type: RoundType, order: number): RoundConfig {
  if (type === 'round_robin') {
    return {
      name: order === 1 ? '小组积分赛' : `第${order}轮 · 循环赛`,
      type: 'round_robin', order, matchFormat: 'BO1',
      groups: 2, teamsPerGroup: 4, pointsWin: 3, pointsDraw: 1, pointsLoss: 0, promotionCount: 2,
    };
  }
  return {
    name: order === 2 ? '淘汰赛' : `第${order}轮 · 淘汰赛`,
    type: 'knockout', order, matchFormat: 'BO3',
    seedingRule: 'cross_group',
  };
}

export default function SeasonManage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadSeasons(); }, []);

  async function loadSeasons() {
    setLoading(true); setError(null);
    try { setSeasons((await getSeasonList({ limit: 50 })).list); }
    catch { setError('加载赛季列表失败'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditingId(null);
    setName(''); setStartDate(''); setEndDate('');
    setRounds([defaultRound('round_robin', 1), defaultRound('knockout', 2)]);
    setMsg(''); setDialogOpen(true);
  }

  function openEdit(s: Season) {
    setEditingId(s.id);
    setName(s.name);
    setStartDate(s.startDate.split('T')[0]);
    setEndDate(s.endDate.split('T')[0]);
    setRounds(s.tournamentConfig?.rounds ?? [defaultRound('round_robin', 1), defaultRound('knockout', 2)]);
    setMsg(''); setDialogOpen(true);
  }

  function addRound() {
    setRounds(prev => [...prev, defaultRound('knockout', prev.length + 1)]);
  }

  function removeRound(idx: number) {
    setRounds(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i + 1 })));
  }

  function updateRound(idx: number, patch: Partial<RoundConfig>) {
    setRounds(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } as RoundConfig : r));
  }

  async function handleSave() {
    if (!name || !startDate || !endDate) { setMsg('请填写赛季名称和日期'); return; }
    if (rounds.length === 0) { setMsg('至少配置一轮赛制'); return; }
    setSaving(true); setMsg('');
    try {
      const config = { rounds };
      if (editingId) {
        await updateSeason(editingId, { name, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(), config });
        setMsg('赛季已更新');
      } else {
        await createSeason({ name, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(), config });
        setMsg('赛季创建成功');
      }
      setDialogOpen(false);
      await loadSeasons();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || '保存失败');
    } finally { setSaving(false); }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>🏆 赛季管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}>
          新建赛季
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1A1D2E', border: '1px solid #242840', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>赛季名称</TableCell>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>日期</TableCell>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>赛制轮次</TableCell>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>状态</TableCell>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>队伍/比赛</TableCell>
              <TableCell sx={{ color: '#6B7394', fontWeight: 600, borderColor: '#1E2340' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seasons.map(s => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ color: '#E8EAF0', borderColor: '#151827' }}>{s.name}</TableCell>
                <TableCell sx={{ color: '#8890A8', fontSize: 12, borderColor: '#151827' }}>
                  {new Date(s.startDate).toLocaleDateString()} ~ {new Date(s.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  {s.tournamentConfig?.rounds ? (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      {s.tournamentConfig.rounds.map((r: RoundConfig, i: number) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip label={r.name} size="small"
                            sx={{
                              bgcolor: r.type === 'round_robin' ? 'rgba(66,165,245,0.1)' : 'rgba(211,47,47,0.1)',
                              color: r.type === 'round_robin' ? '#42A5F5' : '#EF5350', fontSize: 10, fontWeight: 600,
                            }}
                          />
                          {i < s.tournamentConfig.rounds.length - 1 && (
                            <ArrowForward sx={{ fontSize: 12, color: '#3A3F58' }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Chip label="未配置" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', fontSize: 10 }} />
                  )}
                </TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <Chip
                    label={s.status === 'ACTIVE' ? '进行中' : s.status === 'COMPLETED' ? '已结束' : '即将开始'}
                    size="small"
                    sx={{
                      bgcolor: s.status === 'ACTIVE' ? 'rgba(76,175,80,0.1)' : s.status === 'COMPLETED' ? 'rgba(255,255,255,0.05)' : 'rgba(66,165,245,0.1)',
                      color: s.status === 'ACTIVE' ? '#4CAF50' : s.status === 'COMPLETED' ? '#8890A8' : '#42A5F5',
                      fontSize: 10, fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#8890A8', fontSize: 12, borderColor: '#151827' }}>
                  {s._count?.teams || 0} 队 / {s._count?.matches || 0} 场
                </TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#C8A951' }}><Edit fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── Create/Edit Dialog ─── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth
        PaperProps={{
          sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }
        }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, flexShrink: 0 }}>
          {editingId ? '编辑赛季' : '创建新赛季'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 4, overflow: 'auto', flex: 1 }}>
          {/* Basic info */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={5}>
              <TextField label="赛季名称" value={name} onChange={e => setName(e.target.value)} fullWidth
                InputLabelProps={{ sx: { color: '#8890A8', fontSize: 15 } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
            </Grid>
            <Grid item xs={6} sm={3.5}>
              <TextField label="开始日期" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} fullWidth
                InputLabelProps={{ shrink: true, sx: { color: '#8890A8', fontSize: 15 } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
            </Grid>
            <Grid item xs={6} sm={3.5}>
              <TextField label="结束日期" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} fullWidth
                InputLabelProps={{ shrink: true, sx: { color: '#8890A8', fontSize: 15 } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#0F1119', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
            </Grid>
          </Grid>

          {/* Rounds editor */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#C8A951' }}>📐 赛制轮次配置</Typography>
            <Button size="small" onClick={addRound} startIcon={<Add />}
              sx={{ color: '#42A5F5', fontSize: 14 }}>添加轮次</Button>
          </Box>

          {/* Round flow */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
            {rounds.map((r, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${r.order}. ${r.name}`}
                  onDelete={rounds.length > 1 ? () => removeRound(i) : undefined}
                  sx={{
                    bgcolor: r.type === 'round_robin' ? 'rgba(66,165,245,0.12)' : 'rgba(211,47,47,0.12)',
                    color: r.type === 'round_robin' ? '#42A5F5' : '#EF5350', fontWeight: 600, fontSize: 14, py: 1,
                    border: '1px solid',
                    borderColor: r.type === 'round_robin' ? 'rgba(66,165,245,0.25)' : 'rgba(211,47,47,0.25)',
                  }}
                />
                {i < rounds.length - 1 && <ArrowForward sx={{ fontSize: 14, color: '#3A3F58' }} />}
              </Box>
            ))}
          </Box>

          {/* Round detail configs */}
          {rounds.map((round, idx) => (
            <Box key={idx} sx={{
              bgcolor: '#0F1119', borderRadius: 2, p: 3, mb: 3, border: '1px solid #1E2340',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#C8A951', whiteSpace: 'nowrap' }}>
                  第 {round.order} 轮 · 配置
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField label="轮次名称" size="small" value={round.name}
                    onChange={e => updateRound(idx, { name: e.target.value })}
                    sx={{
                      width: 180, '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 14 } },
                      '& .MuiInputLabel-root': { color: '#8890A8', fontSize: 13 },
                    }}
                  />
                  <FormControl size="small" sx={{ width: 160 }}>
                    <InputLabel sx={{ color: '#8890A8', fontSize: 13 }}>赛制类型</InputLabel>
                    <Select value={round.type}
                      onChange={e => updateRound(idx, defaultRound(e.target.value as RoundType, round.order))}
                      label="赛制类型"
                      sx={{ bgcolor: '#1A1D2E', color: '#E8EAF0', fontSize: 14, '& .MuiSelect-icon': { color: '#6B7394' }, '& fieldset': { borderColor: '#2A2F45' } }}
                    >
                      {ROUND_TYPES.map(t => <MenuItem key={t.value} value={t.value} sx={{ fontSize: 14 }}>{t.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ width: 110 }}>
                    <InputLabel sx={{ color: '#8890A8', fontSize: 13 }}>比赛局数</InputLabel>
                    <Select value={round.matchFormat}
                      onChange={e => updateRound(idx, { matchFormat: e.target.value as 'BO1' | 'BO3' | 'BO5' })}
                      label="比赛局数"
                      sx={{ bgcolor: '#1A1D2E', color: '#E8EAF0', fontSize: 14, '& .MuiSelect-icon': { color: '#6B7394' }, '& fieldset': { borderColor: '#2A2F45' } }}
                    >
                      {FORMAT_OPTIONS.map(f => <MenuItem key={f} value={f} sx={{ fontSize: 14 }}>{f}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {round.type === 'round_robin' ? (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={4}>
                    <TextField label="分组数" type="number" size="medium" value={round.groups || ''}
                      onChange={e => updateRound(idx, { groups: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="每组队伍数" type="number" size="medium" value={round.teamsPerGroup || ''}
                      onChange={e => updateRound(idx, { teamsPerGroup: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="每组晋级人数" type="number" size="medium" value={round.promotionCount || ''}
                      onChange={e => updateRound(idx, { promotionCount: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="胜场积分" type="number" size="medium" value={round.pointsWin || ''}
                      onChange={e => updateRound(idx, { pointsWin: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="平局积分" type="number" size="medium" value={round.pointsDraw || ''}
                      onChange={e => updateRound(idx, { pointsDraw: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="负场积分" type="number" size="medium" value={round.pointsLoss || ''}
                      onChange={e => updateRound(idx, { pointsLoss: Number(e.target.value) })} fullWidth
                      InputLabelProps={{ sx: { color: '#8890A8', fontSize: 14 } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' }, input: { color: '#E8EAF0', fontSize: 15 } } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: 13, color: '#8890A8', mt: 0.5 }}>
                      总队伍数 = {round.groups || 0} × {round.teamsPerGroup || 0} = {(round.groups || 0) * (round.teamsPerGroup || 0)} 队 ·
                      晋级 {round.groups || 0} × {round.promotionCount || 0} = {(round.groups || 0) * (round.promotionCount || 0)} 队进入下一轮
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl size="medium" fullWidth>
                      <InputLabel sx={{ color: '#8890A8', fontSize: 14 }}>对阵生成规则</InputLabel>
                      <Select value={round.seedingRule || 'cross_group'}
                        onChange={e => updateRound(idx, { seedingRule: e.target.value as any })}
                        label="对阵生成规则"
                        sx={{ bgcolor: '#1A1D2E', color: '#E8EAF0', fontSize: 14, '& .MuiSelect-icon': { color: '#6B7394' }, '& fieldset': { borderColor: '#2A2F45' } }}
                      >
                        <MenuItem value="cross_group" sx={{ fontSize: 14 }}>交叉对阵 (A1vsB2, B1vsA2)</MenuItem>
                        <MenuItem value="auto" sx={{ fontSize: 14 }}>按排名自动配对</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: 13, color: '#8890A8', pt: 1.5 }}>
                      上一轮晋级 {round.order > 1 ? (rounds[round.order - 2].groups || 2) * (rounds[round.order - 2].promotionCount || 2) : 4} 支队伍进入本轮
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          ))}

          {msg && <Alert severity={msg.includes('成功') ? 'success' : 'error'} sx={{ mt: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}>{msg}</Alert>}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#6B7394' }}>取消</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}>
            {saving ? '保存中...' : '保存赛季'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
