import { useState, useEffect } from 'react';
import { Box, Typography, Button, Tabs, Tab, Grid, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMatchList } from '../api/matches';
import { getUserLeaderboard } from '../api/leaderboard';
import { getSeasonList } from '../api/seasons';
import { getMyBets } from '../api/bets';
import { getMe } from '../api/auth';
import { checkin } from '../api/checkin';
import { useAuth } from '../hooks/useAuth';
import MatchCard from '../components/match/MatchCard';
import UserRankTable from '../components/leaderboard/UserRankTable';
import Loading from '../components/common/Loading';
import type { MatchItem, UserRank, Season } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [betMatchIds, setBetMatchIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Check-in state
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [localCoins, setLocalCoins] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [matchData, rankData, seasonData] = await Promise.all([
          getMatchList({ limit: 6 }),
          getUserLeaderboard({ limit: 10 }),
          getSeasonList({ limit: 10 }),
        ]);
        setMatches(matchData.list);
        setLeaderboard(rankData.list);
        setSeasons(seasonData.list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load user's bets for visual indicator
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

  // Load user profile for check-in status
  useEffect(() => {
    if (!isAuthenticated) return;
    getMe()
      .then((data) => {
        setCanCheckIn(data.canCheckIn ?? false);
        setLocalCoins(data.coins);
        setUser(data);
      })
      .catch(() => {});
  }, [isAuthenticated, setUser]);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    setCheckinMsg('');
    try {
      const result = await checkin();
      setCanCheckIn(false);
      setLocalCoins(result.newBalance);
      if (user) setUser({ ...user, coins: result.newBalance, canCheckIn: false } as any);
      setCheckinMsg(`签到成功！+${result.earned} 币`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '签到失败';
      setCheckinMsg(msg);
      if (msg.includes('今日已签到')) setCanCheckIn(false);
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) return <Loading />;

  const activeSeason = seasons.find(s => s.status === 'ACTIVE');

  return (
    <Box>
      {/* ─── Hero Banner ─── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1F1B3A, #1A1140, #0F1A30)',
        borderRadius: 3,
        p: { xs: 2.5, sm: 4 },
        textAlign: 'center',
        border: '1px solid rgba(200,169,81,0.12)',
        mb: 4,
      }}>
        <Typography sx={{
          fontWeight: 800, mb: 1,
          background: 'linear-gradient(135deg, #C8A951, #E8C97A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: { xs: 20, md: 26 },
        }}>
          {activeSeason ? `${activeSeason.name} 火热进行中` : '王者荣耀在线竞猜'}
        </Typography>
        <Typography sx={{ color: '#6B7394', mb: 3, fontSize: { xs: 13, sm: 14 } }}>
          {matches.length} 场比赛即将开始 · 参与竞猜赢取丰厚奖励
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mb: 2.5 }}>
          {[
            { label: `${seasons[0]?._count?.teams || 8}`, sub: '参赛队伍' },
            { label: `${seasons[0]?._count?.matches || 12}`, sub: '总场次' },
            { label: `${leaderboard.length}`, sub: '竞猜达人' },
            ...(isAuthenticated && localCoins !== null
              ? [{ label: `${localCoins}`, sub: '我的余额' }]
              : []),
          ].map((s, i) => (
            <Box key={i} sx={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 2, px: 2.5, py: 1.2,
              border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
              minWidth: 75,
            }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#C8A951', lineHeight: 1.2 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: 10, color: '#6B7394' }}>{s.sub}</Typography>
            </Box>
          ))}
        </Box>

        {/* Daily Check-in */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={handleCheckin}
              disabled={checkinLoading || !canCheckIn}
              variant="contained"
              sx={{
                background: canCheckIn
                  ? 'linear-gradient(135deg, #C8A951, #D4A843)'
                  : '#2A2F45',
                color: canCheckIn ? '#0F1119' : '#6B7394',
                fontWeight: 700, fontSize: { xs: 14, sm: 15 },
                px: 4, py: 1, borderRadius: 2,
                boxShadow: canCheckIn ? '0 0 16px rgba(200,169,81,0.3)' : 'none',
                '&:hover': canCheckIn
                  ? { background: 'linear-gradient(135deg, #B8942E, #C8A951)', boxShadow: '0 0 20px rgba(200,169,81,0.4)' }
                  : {},
                '&.Mui-disabled': { bgcolor: '#2A2F45', color: '#6B7394' },
              }}
            >
              {checkinLoading ? (
                <CircularProgress size={18} sx={{ color: '#C8A951', mr: 1 }} />
              ) : null}
              {checkinLoading ? '签到中...' : canCheckIn ? '🎁 每日签到 +5 币' : '✅ 今日已签到'}
            </Button>
            {checkinMsg && (
              <Alert
                severity={checkinMsg.includes('成功') ? 'success' : 'warning'}
                sx={{
                  bgcolor: checkinMsg.includes('成功') ? 'rgba(46,125,50,0.15)' : 'rgba(237,108,2,0.15)',
                  color: checkinMsg.includes('成功') ? '#66BB6A' : '#FFA726',
                  py: 0, px: 2, fontSize: 12, '& .MuiAlert-icon': { fontSize: 16 },
                }}
              >
                {checkinMsg}
              </Alert>
            )}
          </Box>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            sx={{
              color: '#C8A951', borderColor: 'rgba(200,169,81,0.3)',
              fontWeight: 600, fontSize: 13,
            }}
            variant="outlined"
          >
            登录后每日签到领币
          </Button>
        )}
      </Box>

      {/* ─── Tabs ─── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          mb: 3, '& .MuiTabs-indicator': { backgroundColor: '#C8A951' },
          '& .MuiTab-root': {
            color: '#6B7394', fontWeight: { xs: 600, sm: 700 },
            fontSize: { xs: 13, sm: 14 }, minWidth: 0, flex: 1,
            '&.Mui-selected': { color: '#C8A951' },
          },
        }}
      >
        <Tab label="🔥 近期比赛" />
        <Tab label="🏆 排行" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          {matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <MatchCard match={match} hasBet={betMatchIds.has(match.id)} />
            </Grid>
          ))}
          {matches.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" py={6}>
                暂无比赛数据
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && <UserRankTable users={leaderboard} />}

      {/* ─── Bottom links ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mt: 4, flexWrap: 'wrap' }}>
        <Button onClick={() => navigate('/matches')} sx={{ color: '#C8A951', fontSize: { xs: 13, sm: 14 } }}>查看全部比赛 →</Button>
        <Button onClick={() => navigate('/leaderboard')} sx={{ color: '#CBD0E0', fontSize: { xs: 13, sm: 14 } }}>全部排行榜 →</Button>
      </Box>
    </Box>
  );
}
