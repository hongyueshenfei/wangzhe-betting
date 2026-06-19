import { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { getUserLeaderboard, getTeamLeaderboard } from '../api/leaderboard';
import UserRankTable from '../components/leaderboard/UserRankTable';
import TeamRankTable from '../components/leaderboard/TeamRankTable';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { UserRank, TeamRank } from '../types';

export default function Leaderboard() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<UserRank[]>([]);
  const [teams, setTeams] = useState<TeamRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [userData, teamData] = await Promise.all([
          getUserLeaderboard({ limit: 50 }),
          getTeamLeaderboard({ limit: 50 }),
        ]);
        setUsers(userData.list);
        setTeams(teamData.list);
      } catch {
        setError('加载排行榜失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Box>
      <PageHeader title="排行榜" subtitle="查看投注高手和最强战队" />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          '& .MuiTabs-indicator': { bgcolor: '#C8A951' },
          '& .MuiTab-root': {
            color: '#6B7394',
            fontWeight: 700,
            '&.Mui-selected': { color: '#C8A951' },
          },
        }}
        TabIndicatorProps={{ sx: { bgcolor: '#C8A951' } }}
      >
        <Tab label="投注英雄榜" />
        <Tab label="战队排行榜" />
      </Tabs>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : tab === 0 ? (
        <UserRankTable users={users} />
      ) : (
        <TeamRankTable teams={teams} />
      )}
    </Box>
  );
}
