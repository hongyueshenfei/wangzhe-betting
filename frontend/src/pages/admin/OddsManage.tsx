import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { updateOdds } from '../../api/admin';
import { getMatchList } from '../../api/matches';
import { getSeasonList } from '../../api/seasons';
import OddsAdjustDialog from '../../components/admin/OddsAdjustDialog';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import { formatDateTime, getMatchStatusLabel } from '../../utils/format';
import type { MatchItem, Season } from '../../types';

export default function OddsManage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState('');
  const [seasonId, setSeasonId] = useState<number | ''>('');
  const limit = 20;

  // Dialog state
  const [adjustDialog, setAdjustDialog] = useState<MatchItem | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchList({
        page,
        limit,
        seasonId: seasonId || undefined,
      });
      setMatches(data.list);
      setTotal(data.total);
    } catch {
      setError('加载比赛列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, seasonId]);

  useEffect(() => {
    loadMatches();
    getSeasonList({ limit: 50 }).then((d) => setSeasons(d.list)).catch(() => {});
  }, [loadMatches]);

  const handleOddsSubmit = async (data: { oddsA?: number; oddsB?: number }) => {
    if (!adjustDialog) return;
    await updateOdds(adjustDialog.id, data);
    setMsg('赔率已更新');
    setAdjustDialog(null);
    loadMatches();
  };

  if (loading && matches.length === 0) return <Loading />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 26, color: '#E8EAF0', mb: 3 }}>
        💰 赔率管理
      </Typography>

      {msg && (
        <Alert
          severity="success"
          sx={{ mb: 2, bgcolor: 'rgba(46,125,50,0.1)', color: '#66BB6A' }}
          onClose={() => setMsg('')}
        >
          {msg}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#EF5350' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Season filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 200,
          mb: 2,
          '& .MuiInputLabel-root': { color: '#8890A8' },
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0F1119',
            color: '#E8EAF0',
            '& fieldset': { borderColor: '#2A2F45' },
            '&:hover fieldset': { borderColor: '#3A3F58' },
            '&.Mui-focused fieldset': { borderColor: '#C8A951' },
          },
          '& .MuiSvgIcon-root': { color: '#8890A8' },
        }}
      >
        <InputLabel>赛季</InputLabel>
        <Select
          value={seasonId}
          label="赛季"
          onChange={(e) => {
            setSeasonId(e.target.value === '' ? '' : Number(e.target.value));
            setPage(1);
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#1A1D2E',
                border: '1px solid #1E2340',
                '& .MuiMenuItem-root': { color: '#E8EAF0', '&:hover': { bgcolor: '#242840' } },
              },
            },
          }}
        >
          <MenuItem value="">全部赛季</MenuItem>
          {seasons.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
              <TableCell>比赛</TableCell>
              <TableCell>状态</TableCell>
              <TableCell align="right">A 赔率</TableCell>
              <TableCell align="right">A 投注</TableCell>
              <TableCell align="right">B 赔率</TableCell>
              <TableCell align="right">B 投注</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => (
              <TableRow
                key={match.id}
                hover
                sx={{
                  '&:hover': { bgcolor: 'rgba(200,169,81,0.04)' },
                  '& .MuiTableCell-body': { color: '#E8EAF0', borderColor: '#1E2340' },
                }}
              >
                <TableCell>{match.id}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {match.teamA.name} VS {match.teamB.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8890A8' }}>
                    {formatDateTime(match.matchTime)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getMatchStatusLabel(match.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#E8EAF0' }}
                  >
                    {match.oddsA.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" sx={{ color: '#8890A8' }}>
                    {match.betTotalA} 币 ({match.betCountA}人)
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#E8EAF0' }}
                  >
                    {match.oddsB.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" sx={{ color: '#8890A8' }}>
                    {match.betTotalB} 币 ({match.betCountB}人)
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="调整赔率">
                    <IconButton
                      size="small"
                      onClick={() => setAdjustDialog(match)}
                      sx={{ color: '#C8A951', '&:hover': { color: '#D4A843' } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
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

      {/* Odds Adjust Dialog */}
      {adjustDialog && (
        <OddsAdjustDialog
          open={!!adjustDialog}
          match={adjustDialog}
          onClose={() => setAdjustDialog(null)}
          onSubmit={handleOddsSubmit}
        />
      )}
    </Box>
  );
}
