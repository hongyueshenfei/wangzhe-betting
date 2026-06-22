import { useState, useEffect, useCallback } from 'react';
import { Box, Tabs, Tab, Pagination } from '@mui/material';
import { getMyBets, getMyChampionBets } from '../api/bets';
import { getMyTransactions, type CoinTransaction } from '../api/transactions';
import BetHistory from '../components/bet/BetHistory';
import TransactionList from '../components/bet/TransactionList';
import PageHeader from '../components/common/PageHeader';
import { SectionSkeleton } from '../components/common/Skeletons';
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

  // Convert champion bets to display (no match info needed)
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
    match: undefined,
  }));

  return (
    <Box>
      <PageHeader title="我的投注" subtitle="查看你的投注历史和金币流水" />

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label="比赛投注" />
        <Tab label="冠军投注" />
        <Tab label="💰 流水" />
      </Tabs>

      {loading ? (
        <SectionSkeleton lines={5} />
      ) : error ? (
        <ErrorAlert message={error} onRetry={loadBets} />
      ) : tab === 0 ? (
        <>
          <BetHistory bets={bets} />
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </>
      ) : tab === 1 ? (
        <>
          <BetHistory bets={championBetDisplay} />
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </>
      ) : (
        <>
          <TransactionList transactions={transactions} />
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
