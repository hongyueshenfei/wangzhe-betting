import { useState, useEffect, useCallback } from 'react';
import { Box, Grid, TextField, Pagination } from '@mui/material';
import { getTeamList } from '../api/teams';
import TeamCard from '../components/team/TeamCard';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import type { Team } from '../types';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 12;

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamList({ page, limit, keyword: keyword || undefined });
      setTeams(data.list);
      setTotal(data.total);
    } catch {
      setError('加载战队列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  return (
    <Box>
      <PageHeader title="战队列表" subtitle="查看所有参赛战队" />

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          size="small"
          placeholder="搜索战队名称..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            sx: { color: '#E8EAF0' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0F1119',
              '& fieldset': { borderColor: '#2A2F45' },
              '&:hover fieldset': { borderColor: '#3A3F58' },
              '&.Mui-focused fieldset': { borderColor: '#C8A951' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#6B7394' },
          }}
        />
      </Box>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorAlert message={error} onRetry={loadTeams} />
      ) : (
        <>
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
                <TeamCard team={team} />
              </Grid>
            ))}
          </Grid>
          {teams.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: '#6B7394' }}>
              暂无战队数据
            </Box>
          )}
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
