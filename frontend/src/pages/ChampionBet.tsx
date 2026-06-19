import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
} from '@mui/material';
import { AccessTime, Pool } from '@mui/icons-material';
import { getSeasonList } from '../api/seasons';
import { getTeamList } from '../api/teams';
import { placeChampionBet, getChampionPoolStats, getMyChampionBets } from '../api/bets';
import { useAuth } from '../hooks/useAuth';
import ChampionBetCard from '../components/bet/ChampionBetCard';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';
import { formatDateTime } from '../utils/format';
import type { Season, Team, ChampionPoolStats } from '../api/bets';

export default function ChampionBet() {
  const { user, setUser } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pool stats
  const [poolStats, setPoolStats] = useState<ChampionPoolStats | null>(null);
  const [canBet, setCanBet] = useState(false);

  // User's champion bets
  const [myChampionBetTeamIds, setMyChampionBetTeamIds] = useState<Set<number>>(new Set());

  // Bet modal state
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [betLoading, setBetLoading] = useState(false);
  const [betError, setBetError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const seasonData = await getSeasonList({ limit: 50 });
        setSeasons(seasonData.list);
        const activeSeason = seasonData.list.find(
          (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING',
        );
        if (activeSeason) {
          setSelectedSeasonId(activeSeason.id);
        } else if (seasonData.list.length > 0) {
          setSelectedSeasonId(seasonData.list[0].id);
        }
      } catch {
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load teams and pool stats
  useEffect(() => {
    if (!selectedSeasonId) return;
    Promise.all([
      getTeamList({ seasonId: selectedSeasonId as number, limit: 100 }),
      getChampionPoolStats(selectedSeasonId as number),
      getMyChampionBets({ limit: 100 }),
    ])
      .then(([teamData, stats, myBets]) => {
        setTeams(teamData.list);
        setPoolStats(stats);
        // Build set of team IDs the user has already bet on
        const seasonBets = myBets.list.filter((b) => b.seasonId === selectedSeasonId);
        setMyChampionBetTeamIds(new Set(seasonBets.map((b) => b.teamId)));
        // Can bet if season is upcoming/active AND deadline hasn't passed
        const season = seasons.find((s) => s.id === selectedSeasonId);
        const seasonOpen = season?.status === 'UPCOMING' || season?.status === 'ACTIVE';
        const deadlineOpen = !stats.deadline || new Date() < new Date(stats.deadline);
        setCanBet(seasonOpen && deadlineOpen);
      })
      .catch(() => {});
  }, [selectedSeasonId, seasons]);

  const handleBet = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    setSelectedTeam(team);
    setBetAmount(10);
    setBetError('');
    setBetModalOpen(true);
  };

  const handleConfirmBet = async () => {
    if (!selectedTeam || !selectedSeasonId) return;
    if (betAmount < 1) {
      setBetError('最低投注 1 币');
      return;
    }
    if (user && betAmount > user.coins) {
      setBetError('余额不足');
      return;
    }
    setBetLoading(true);
    setBetError('');
    try {
      const result = await placeChampionBet({
        seasonId: selectedSeasonId as number,
        teamId: selectedTeam.id,
        amount: betAmount,
      });
      if (user) {
        setUser({ ...user, coins: result.newBalance });
      }
      setBetModalOpen(false);
      // Refresh pool stats
      const stats = await getChampionPoolStats(selectedSeasonId as number);
      setPoolStats(stats);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '投注失败';
      setBetError(msg);
    } finally {
      setBetLoading(false);
    }
  };

  const activeSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <Box>
      <PageHeader
        title="冠军竞猜"
        subtitle="预测赛季冠军 · 奖池模式：胜者按投注比例瓜分总奖池"
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          {/* Season selector */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {seasons.map((s) => (
                <Button
                  key={s.id}
                  variant={selectedSeasonId === s.id ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedSeasonId(s.id)}
                  disabled={s.status === 'COMPLETED'}
                  sx={
                    selectedSeasonId === s.id
                      ? { bgcolor: '#C8A951', color: '#0F1119', fontWeight: 700, '&:hover': { bgcolor: '#B8942E' } }
                      : { borderColor: '#2A2F45', color: '#8890A8', '&:hover': { borderColor: '#C8A951', color: '#C8A951' } }
                  }
                >
                  {s.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Pool stats banner */}
          {poolStats && (
            <SectionCard sx={{
              display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 },
              justifyContent: 'center', border: '1px solid #242840',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pool sx={{ color: '#C8A951', fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: 10, color: '#8890A8' }}>奖池累计</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#C8A951' }}>
                    {poolStats.totalPool} 币
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: canBet ? '#66BB6A' : '#EF5350', fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: 10, color: '#8890A8' }}>投注截止</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: canBet ? '#66BB6A' : '#EF5350' }}>
                    {poolStats.deadline
                      ? formatDateTime(poolStats.deadline)
                      : '暂无赛程'}
                  </Typography>
                </Box>
              </Box>
              {!canBet && (
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: 'rgba(239,83,80,0.1)', borderRadius: 1 }}>
                  <Typography sx={{ fontSize: 12, color: '#EF5350', fontWeight: 600 }}>投注已截止</Typography>
                </Box>
              )}
            </SectionCard>
          )}

          {teams.length === 0 ? (
            <EmptyState title="该赛季暂无战队" />
          ) : (
            <Grid container spacing={3}>
              {teams.map((team) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={team.id}>
                  <ChampionBetCard
                    team={team}
                    seasonId={selectedSeasonId as number}
                    canBet={canBet}
                    hasBet={myChampionBetTeamIds.has(team.id)}
                    onBet={handleBet}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Bet confirmation dialog */}
      <Dialog open={betModalOpen} onClose={() => setBetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1E2340', pb: 2, fontSize: 16 }}>
          冠军投注
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTeam && activeSeason && (
            <>
              <Typography sx={{ fontSize: 14, color: '#E8EAF0', mb: 2.5, textAlign: 'center' }}>
                预测 <strong style={{ color: '#C8A951' }}>{activeSeason.name}</strong> 冠军为 <strong style={{ color: '#C8A951' }}>{selectedTeam.name}</strong>
              </Typography>
              {poolStats && (
                <Typography sx={{ fontSize: 12, color: '#8890A8', mb: 2, textAlign: 'center' }}>
                  当前奖池 {poolStats.totalPool} 币 · {poolStats.betCount} 次投注
                </Typography>
              )}
              <Typography sx={{ fontSize: 11, color: '#8890A8', mb: 2, textAlign: 'center' }}>
                可对多个战队分别投注 · 最终冠军队伍按投注比例瓜分总奖池
              </Typography>
              <TextField
                label="投注金额"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                helperText={user ? `可用余额: ${user.coins} 币` : ''}
                inputProps={{ min: 1 }}
              />
            </>
          )}
          {betError && <Alert severity="error" sx={{ mt: 2 }}>{betError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1E2340', px: 3, py: 2 }}>
          <Button onClick={() => setBetModalOpen(false)} disabled={betLoading} color="inherit">
            取消
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmBet} disabled={betLoading}>
            {betLoading ? '投注中...' : '确认投注'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
