import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Tooltip, Pagination, Alert, FormControl, InputLabel, Select,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Edit, RemoveCircle, PlayArrow } from '@mui/icons-material';
import { updateMatchResult, forfeitMatch, generateMatches, generateKnockoutMatches, updateMatchTime } from '../../api/admin';
import { getMatchList } from '../../api/matches';
import { getSeasonList } from '../../api/seasons';
import MatchFormDialog from '../../components/admin/MatchFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import { formatDateTime, getMatchStatusLabel } from '../../utils/format';
import type { MatchItem, Season, RoundConfig } from '../../types';

export default function MatchManage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [editingTime, setEditingTime] = useState<{ matchId: number; time: string } | null>(null);
  const [timeEditVal, setTimeEditVal] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'forfeit'; matchId: number; teamId: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);

  // Generate dialog
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [genMatchesPerDay, setGenMatchesPerDay] = useState(2);

  const currentSeason = seasons.find(s => s.id === selectedSeason);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [seasonData, matchData] = await Promise.all([
        getSeasonList({ limit: 50 }),
        getMatchList({ seasonId: selectedSeason || undefined, page, limit: 20 }),
      ]);
      setSeasons(seasonData.list);
      setMatches(matchData.list);
      setTotal(matchData.total);
      if (!selectedSeason && seasonData.list.length > 0) {
        setSelectedSeason(seasonData.list[0].id);
      }
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  }, [selectedSeason, page]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerateGroup() {
    if (!selectedSeason) return;
    setGenerating(true); setMsg('');
    try {
      const result = await generateMatches({ seasonId: selectedSeason, startDate: new Date(genStartDate).toISOString(), matchesPerDay: genMatchesPerDay });
      setMsg(`小组赛生成成功！共 ${result.created} 场比赛`);
      setGenDialogOpen(false);
      await load();
    } catch (e: any) { setMsg(e?.response?.data?.message || '生成失败'); }
    finally { setGenerating(false); }
  }

  async function handleGenerateKnockout() {
    if (!selectedSeason) return;
    setGenerating(true); setMsg('');
    try {
      const result = await generateKnockoutMatches(selectedSeason);
      setMsg(`淘汰赛生成成功！共 ${result.created} 场比赛`);
      setGenDialogOpen(false);
      await load();
    } catch (e: any) { setMsg(e?.response?.data?.message || '生成失败'); }
    finally { setGenerating(false); }
  }

  function openTimeEdit(m: MatchItem) {
    if (m.status !== 'UPCOMING') return;
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const d = new Date(m.matchTime);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setTimeEditVal(local);
    setEditingTime({ matchId: m.id, time: m.matchTime });
  }

  async function handleTimeSave() {
    if (!editingTime || !timeEditVal) return;
    try {
      await updateMatchTime(editingTime.matchId, new Date(timeEditVal).toISOString());
      setEditingTime(null);
      load();
    } catch { /* ignore */ }
  }

  async function handleForfeit(matchId: number, teamId: number) {
    try {
      await forfeitMatch(matchId, teamId);
      setMsg('已标记弃赛，投注将全额退款');
      setConfirmOpen(false);
      await load();
    } catch (e: any) { setMsg(e?.response?.data?.message || '操作失败'); }
  }

  if (loading && matches.length === 0) return <Loading />;
  if (error) return <ErrorAlert message={error} />;

  const config = currentSeason?.tournamentConfig;
  const roundRobin = config?.rounds?.find((r: RoundConfig) => r.type === 'round_robin');
  const knockoutRounds = config?.rounds?.filter((r: RoundConfig) => r.type === 'knockout') || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>⚔️ 比赛管理</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ width: 180 }}>
            <Select value={selectedSeason || ''} onChange={e => { setSelectedSeason(Number(e.target.value)); setPage(1); }}
              sx={{ bgcolor: '#1A1D2E', color: '#E8EAF0', '& .MuiSelect-icon': { color: '#8890A8' }, '& fieldset': { borderColor: '#2A2F45' } }}>
              {seasons.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" size="small" onClick={() => setGenDialogOpen(true)}
            startIcon={<PlayArrow />}
            sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}>
            生成赛程
          </Button>
        </Box>
      </Box>

      {/* Season Config Info */}
      {currentSeason?.tournamentConfig && (
        <Box sx={{
          bgcolor: '#0F1119', borderRadius: 2, p: 2, mb: 3, border: '1px solid #1E2340',
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#C8A951', mr: 1 }}>赛制配置：</Typography>
          {config!.rounds.map((r: RoundConfig, i: number) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${r.order}. ${r.name} (${r.matchFormat})`}
                size="small"
                sx={{
                  bgcolor: r.type === 'round_robin' ? 'rgba(66,165,245,0.1)' : 'rgba(211,47,47,0.1)',
                  color: r.type === 'round_robin' ? '#42A5F5' : '#EF5350',
                  fontSize: 11, fontWeight: 600,
                }}
              />
              {i < config!.rounds.length - 1 && (
                <Typography sx={{ fontSize: 10, color: '#3A3F58' }}>→</Typography>
              )}
            </Box>
          ))}
          {roundRobin && (
            <Typography sx={{ fontSize: 10, color: '#8890A8', ml: 'auto' }}>
              每组晋级 {roundRobin.promotionCount || 2} 队
            </Typography>
          )}
        </Box>
      )}

      {msg && <Alert severity={msg.includes('成功') ? 'success' : 'error'} sx={{ mb: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }} onClose={() => setMsg('')}>{msg}</Alert>}

      {/* Match Table */}
      <TableContainer component={Paper} sx={{ bgcolor: '#1A1D2E', border: '1px solid #242840', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>#</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>阶段</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>组/轮次</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>队伍A</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>比分</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>队伍B</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>时间</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>状态</TableCell>
              <TableCell sx={{ color: '#8890A8', fontWeight: 600, borderColor: '#1E2340', fontSize: 11 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map(m => (
              <TableRow key={m.id} hover>
                <TableCell sx={{ color: '#8890A8', fontSize: 10, borderColor: '#151827' }}>{m.id}</TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <Chip label={m.stage === 'GROUP' ? '小组赛' : '淘汰赛'} size="small"
                    sx={{ fontSize: 10, bgcolor: m.stage === 'GROUP' ? 'rgba(66,165,245,0.08)' : 'rgba(211,47,47,0.08)', color: m.stage === 'GROUP' ? '#42A5F5' : '#EF5350' }} />
                </TableCell>
                <TableCell sx={{ color: '#CBD0E0', fontSize: 12, borderColor: '#151827' }}>
                  {m.stage === 'GROUP' ? m.groupName : m.round}
                </TableCell>
                <TableCell sx={{ color: '#E8EAF0', fontSize: 13, fontWeight: 600, borderColor: '#151827' }}>{m.teamA?.name || '待定'}</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 14, borderColor: '#151827' }}>
                  {m.status === 'COMPLETED' ? (
                    <Typography sx={{ color: m.winnerTeamId === m.teamAId ? '#4CAF50' : '#E8EAF0', fontWeight: 800 }}>
                      {m.teamAScore} : {m.teamBScore}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: '#C8A951', fontWeight: 800 }}>— : —</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ color: '#E8EAF0', fontSize: 13, fontWeight: 600, borderColor: '#151827' }}>{m.teamB?.name || '待定'}</TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <Typography
                    onClick={() => openTimeEdit(m)}
                    sx={{
                      color: '#8890A8', fontSize: 12, cursor: m.status === 'UPCOMING' ? 'pointer' : 'default',
                      '&:hover': { color: m.status === 'UPCOMING' ? '#C8A951' : '#8890A8', textDecoration: m.status === 'UPCOMING' ? 'underline' : 'none' },
                    }}
                  >
                    {formatDateTime(m.matchTime)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <Chip label={getMatchStatusLabel(m.status)} size="small"
                    sx={{
                      fontSize: 10,
                      bgcolor: m.status === 'COMPLETED' ? 'rgba(76,175,80,0.1)' : m.status === 'UPCOMING' ? 'rgba(66,165,245,0.1)' : 'rgba(239,83,80,0.1)',
                      color: m.status === 'COMPLETED' ? '#4CAF50' : m.status === 'UPCOMING' ? '#42A5F5' : '#EF5350',
                    }} />
                </TableCell>
                <TableCell sx={{ borderColor: '#151827' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="录入赛果"><IconButton size="small" onClick={() => setEditingMatchId(m.id)} sx={{ color: '#C8A951' }}><Edit fontSize="small" /></IconButton></Tooltip>
                    {m.status !== 'COMPLETED' && m.status !== 'FORFEITED' && (
                      <Tooltip title={`标记 ${m.teamA?.name || '?'} 弃赛`}>
                        <IconButton size="small" onClick={() => { if (!m.teamAId) return; setConfirmAction({ type: 'forfeit', matchId: m.id, teamId: m.teamAId }); setConfirmOpen(true); }} sx={{ color: '#EF5350', '&:hover': { bgcolor: 'rgba(239,83,80,0.1)' } }}>
                          <RemoveCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {matches.length === 0 && (
              <TableRow><TableCell colSpan={9} sx={{ textAlign: 'center', color: '#8890A8', py: 4, borderColor: '#151827' }}>
                暂无比赛 · 请先生成赛程
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > 20 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={Math.ceil(total / 20)} page={page} onChange={(_, p) => setPage(p)} sx={{
            '& .MuiPaginationItem-root': {
              color: '#8890A8',
              bgcolor: '#0F1119',
              border: '1px solid #2A2F45',
              borderRadius: '20px',
              fontWeight: 500,
              fontSize: 13,
              minWidth: 34,
              height: 34,
              transition: 'all 0.15s ease',
              '&.Mui-selected': {
                color: '#FFFFFF',
                bgcolor: '#C8A951',
                borderColor: '#C8A951',
                fontWeight: 700,
              },
              '&.Mui-selected:hover': { bgcolor: '#B8942E' },
              '&:hover': { bgcolor: 'rgba(200,169,81,0.08)', borderColor: '#3A3F58' },
            },
          }} />
        </Box>
      )}

      {/* ─── Generate Dialog ─── */}
      <Dialog open={genDialogOpen} onClose={() => setGenDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340' }}>生成赛程</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          {config ? (
            <Box>
              <Typography sx={{ mb: 2, fontSize: 13, color: '#8890A8' }}>
                根据赛季赛制配置生成以下比赛：
              </Typography>
              {roundRobin && (
                <Box sx={{ bgcolor: '#0F1119', borderRadius: 2, p: 2, mb: 2, border: '1px solid #1E2340' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
                    🏟 第 1 轮 · {roundRobin.name} ({roundRobin.matchFormat})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 12, color: '#8890A8' }}>
                      {roundRobin.groups} 组 × {roundRobin.teamsPerGroup} 队 · 单循环
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#8890A8' }}>
                      积分：胜 {roundRobin.pointsWin} / 平 {roundRobin.pointsDraw} / 负 {roundRobin.pointsLoss}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#8890A8' }}>
                      晋级：每组前 {roundRobin.promotionCount}
                    </Typography>
                  </Box>

                  {/* Schedule config */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField
                      label="赛程开始日期"
                      type="date"
                      size="small"
                      value={genStartDate}
                      onChange={(e) => setGenStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true, sx: { color: '#8890A8', fontSize: 13 } }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' } },
                        '& input': { color: '#E8EAF0', fontSize: 14, colorScheme: 'dark' },
                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                          filter: 'invert(0.7)', cursor: 'pointer', padding: '6px', marginRight: '0',
                        },
                        '& input[type="date"]::-webkit-calendar-picker-indicator:hover': { filter: 'invert(1)' },
                      }}
                    />
                    <TextField
                      label="每天场数"
                      type="number"
                      size="small"
                      value={genMatchesPerDay}
                      onChange={(e) => setGenMatchesPerDay(Math.max(1, Number(e.target.value)))}
                      inputProps={{ min: 1, max: 8, style: { fontSize: 14, color: '#E8EAF0' } }}
                      InputLabelProps={{ shrink: true, sx: { color: '#8890A8', fontSize: 13 } }}
                      sx={{
                        width: 120,
                        '& .MuiOutlinedInput-root': { bgcolor: '#1A1D2E', '& fieldset': { borderColor: '#2A2F45' } },
                      }}
                    />
                  </Box>

                  <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }}
                    disabled={generating} onClick={handleGenerateGroup}>
                    {generating ? '生成中...' : '生成小组赛赛程'}
                  </Button>
                </Box>
              )}

              {knockoutRounds.map((r: RoundConfig, i: number) => (
                <Box key={i} sx={{ bgcolor: '#0F1119', borderRadius: 2, p: 2, mb: 2, border: '1px solid #1E2340' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
                    ⚔️ 第 {r.order} 轮 · {r.name} ({r.matchFormat})
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#8890A8', mb: 1 }}>
                    对阵规则：{r.seedingRule === 'cross_group' ? '交叉对阵 (A1vsB2, B1vsA2)' : '自动配对'}
                  </Typography>
                  {i === 0 ? (
                    <Button variant="contained" fullWidth sx={{ mt: 1, bgcolor: '#D32F2F', color: '#FFF', fontWeight: 700, '&:hover': { bgcolor: '#B71C1C' } }}
                      disabled={generating} onClick={handleGenerateKnockout}>
                      {generating ? '生成中...' : '生成淘汰赛赛程'}
                    </Button>
                  ) : (
                    <Typography sx={{ fontSize: 11, color: '#8890A8' }}>
                      此轮将在上一轮淘汰赛完成后自动生成
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography sx={{ mb: 3, color: '#8890A8', fontSize: 13 }}>
                当前赛季未配置赛制。将使用默认配置（A/B组，每组前2晋级，A1vsB2淘汰赛）。
              </Typography>
              <Button variant="contained" fullWidth sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700 }}
                disabled={generating} onClick={handleGenerateGroup}>
                {generating ? '生成中...' : '生成小组赛 + 淘汰赛'}
              </Button>
            </Box>
          )}
          {msg && <Alert severity={msg.includes('成功') ? 'success' : 'error'} sx={{ mt: 2 }}>{msg}</Alert>}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 1.5 }}>
          <Button onClick={() => setGenDialogOpen(false)} sx={{ color: '#8890A8' }}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* Match Form Dialog */}
      {editingMatchId && (() => {
        const currentMatch = matches.find(m => m.id === editingMatchId);
        if (!currentMatch) return null;
        return (
          <MatchFormDialog
            match={currentMatch}
            open={true}
            onClose={() => setEditingMatchId(null)}
            onSubmit={async (data) => {
              await updateMatchResult(currentMatch.id, data);
              setEditingMatchId(null);
              load();
            }}
          />
        );
      })()}

      {/* Edit Match Time Dialog */}
      <Dialog open={!!editingTime} onClose={() => setEditingTime(null)} maxWidth="sm" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { bgcolor: '#1A1D2E', color: '#E8EAF0', border: '1px solid #242840', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, fontSize: 17 }}>
          修改比赛时间
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Typography sx={{ fontSize: 14, color: '#8890A8', mb: 2.5 }}>
            选择新的比赛日期和时间
          </Typography>
          <TextField
            type="datetime-local"
            value={timeEditVal}
            onChange={(e) => setTimeEditVal(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true, sx: { color: '#8890A8', fontSize: 15 } }}
            inputProps={{ style: { color: '#E8EAF0', fontSize: 18, padding: '14px 16px' } }}
            helperText="点击右侧日历图标选择日期和时间"
            FormHelperTextProps={{ sx: { color: '#8890A8', fontSize: 12, mt: 0.5 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0F1119',
                '& fieldset': { borderColor: '#2A2F45' },
                '&:hover fieldset': { borderColor: '#C8A951' },
                '&.Mui-focused fieldset': { borderColor: '#C8A951', borderWidth: 2 },
              },
              '& .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                filter: 'invert(0.8)',
                cursor: 'pointer',
                transform: 'scale(1.3)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setEditingTime(null)} sx={{ color: '#8890A8', fontSize: 14 }}>取消</Button>
          <Button onClick={handleTimeSave} variant="contained"
            sx={{ bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, fontSize: 14, px: 3, '&:hover': { bgcolor: '#B8942E' } }}>
            确认修改
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forfeit Confirm */}
      {confirmAction && (
        <ConfirmDialog
          title="确认弃赛"
          message={`标记弃赛后，该场比赛的所有投注将被全额退款。确认？`}
          open={confirmOpen}
          onConfirm={() => handleForfeit(confirmAction.matchId, confirmAction.teamId)}
          onCancel={() => { setConfirmOpen(false); setConfirmAction(null); }}
        />
      )}
    </Box>
  );
}
