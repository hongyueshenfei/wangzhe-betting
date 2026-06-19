import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  People,
  SportsEsports,
  AttachMoney,
  Assessment,
  EmojiEvents,
  AccountBalance,
} from '@mui/icons-material';
import { getDashboard } from '../../api/admin';
import AdminStatCard from '../../components/admin/AdminStatCard';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import { formatCoins } from '../../utils/format';
import type { AdminDashboard } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboard();
        setData(result);
      } catch {
        setError('加载数据看板失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 26, color: '#E8EAF0', mb: 3 }}>
        📊 数据看板
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="总用户数"
            value={data.totalUsers}
            subtitle={`投注人: ${data.totalBettors}`}
            color="#1976d2"
            icon={<People />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="赛季数"
            value={data.totalSeasons}
            subtitle={`进行中: ${data.activeSeasons}`}
            color="#2e7d32"
            icon={<EmojiEvents />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="比赛数"
            value={data.totalMatches}
            subtitle={`已完成: ${data.completedMatches} | 未开始: ${data.upcomingMatches}`}
            color="#ed6c02"
            icon={<SportsEsports />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="投注总数"
            value={data.totalBets}
            subtitle={`交易记录: ${data.totalTransactions}`}
            color="#9c27b0"
            icon={<Assessment />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="总投注金额"
            value={formatCoins(data.totalBetAmount)}
            color="#d32f2f"
            icon={<AttachMoney />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AdminStatCard
            title="市场流通币"
            value={formatCoins(data.totalCoinsInCirculation)}
            color="#0288d1"
            icon={<AccountBalance />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
