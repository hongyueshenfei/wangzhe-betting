import { useState, useEffect, useCallback } from 'react';
import { Box, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getMatchList } from '../api/matches';
import { getSeasonList } from '../api/seasons';
import { getMyBets } from '../api/bets';
import { useAuth } from '../hooks/useAuth';
import MatchList from '../components/match/MatchList';
import MatchFilter from '../components/match/MatchFilter';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { MatchItem, Season } from '../types';

export default function Matches() {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [betMatchIds, setBetMatchIds] = useState<Set<number>>(new Set());
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [seasonId, setSeasonId] = useState<number | ''>('');
  const limit = 12;

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchList({
        page,
        limit,
        stage: stage || undefined,
        status: status || undefined,
        seasonId: seasonId || undefined,
      });
      setMatches(data.list);
      setTotal(data.total);
    } catch {
      setError('加载比赛列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, stage, status, seasonId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    getSeasonList({ limit: 50 }).then((d) => setSeasons(d.list)).catch(() => {});
  }, []);

  // Load user's bet match IDs for visual indicators
  useEffect(() => {
    if (!isAuthenticated) return;
    getMyBets({ limit: 200 })
      .then((data) => {
        const ids = new Set<number>();
        data.list.forEach((b: any) => ids.add(b.matchId));
        setBetMatchIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleStageChange = (s: string) => {
    setStage(s);
    setPage(1);
  };

  const handleStatusChange = (s: string) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <Box>
      <PageHeader title="比赛列表" subtitle="查看所有比赛，为你支持的战队投注" />

      {/* Season selector */}
      <FormControl
        size="small"
        sx={{
          minWidth: { xs: '100%', sm: 200 },
          mb: 2,
          '& .MuiInputLabel-root': { color: '#6B7394' },
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

      <MatchFilter
        stage={stage}
        status={status}
        onStageChange={handleStageChange}
        onStatusChange={handleStatusChange}
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorAlert message={error} onRetry={loadMatches} />
      ) : (
        <>
          <MatchList matches={matches} betMatchIds={betMatchIds} />
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
        </>
      )}
    </Box>
  );
}
