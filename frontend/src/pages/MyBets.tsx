import { useState, useEffect, useCallback } from 'react';
import { Box, Tabs, Tab, Pagination } from '@mui/material';
import { getMyBets, getMyChampionBets } from '../api/bets';
import { getMyTransactions, type CoinTransaction } from '../api/transactions';
import BetHistory from '../components/bet/BetHistory';
import TransactionList from '../components/bet/TransactionList';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { Bet, ChampionBet } from '../types';

export default function MyBets() {
  const [tab, setTab] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [championBets, setChampionBets] = useState<ChampionBet[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadBets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 0) {
        const data = await getMyBets({ page, limit });
        setBets(data.list);
        setTotal(data.total);
      } else if (tab === 1) {
        const data = await getMyChampionBets({ page, limit });
        setChampionBets(data.list);
        setTotal(data.total);
      } else {
        const data = await getMyTransactions({ page, limit });
        setTransactions(data.list);
        setTotal(data.total);
      }
    } catch {
      setError('加载记录失败');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  // Convert champion bets to display
  const championBetDisplay = championBets.map((cb) => ({
    id: cb.id,
    userId: cb.userId,
    matchId: cb.seasonId,
    pickedTeamId: cb.teamId,
    pickedTeam: cb.team,
    amount: cb.amount,
    oddsAtBet: cb.oddsAtBet,
    status: cb.status,
    createdAt: cb.createdAt,
    settledAt: cb.settledAt,
    match: cb.season
      ? {
          id: cb.seasonId,
          teamA: { id: 1, name: '冠军', logoUrl: null },
          teamB: { id: 2, name: cb.team?.name || '', logoUrl: null },
          season: { id: cb.seasonId, name: cb.season?.name || '' },
        }
      : undefined,
  }));

  return (
    <Box>
      <PageHeader title="我的投注" subtitle="查看你的投注历史和金币流水" />

      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTabs-indicator': { bgcolor: '#C8A951' },
          '& .MuiTab-root': {
            color: '#6B7394',
            fontWeight: 700,
            fontSize: { xs: 12, sm: 14 }, minWidth: 'auto', px: { xs: 1.5, sm: 2.5 },
            '&.Mui-selected': { color: '#C8A951' },
          },
        }}
      >
        <Tab label="比赛投注" />
        <Tab label="冠军投注" />
        <Tab label="💰 流水" />
      </Tabs>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorAlert message={error} onRetry={loadBets} />
      ) : tab === 0 ? (
        <>
          <BetHistory bets={bets} />
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
      ) : tab === 1 ? (
        <>
          <BetHistory bets={championBetDisplay} />
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
      ) : (
        <>
          <TransactionList transactions={transactions} />
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
