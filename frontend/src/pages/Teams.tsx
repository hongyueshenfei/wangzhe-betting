import { useState, useEffect, useCallback } from 'react';
import { Box, Grid, TextField, Pagination, IconButton, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { getTeamList } from '../api/teams';
import TeamCard from '../components/team/TeamCard';
import PageHeader from '../components/common/PageHeader';
import { SectionSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
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
          sx={{ minWidth: 260 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearch} sx={{ color: '#8890A8' }}>
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <SectionSkeleton lines={6} />
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
            <EmptyState
              title="未找到匹配的战队"
              description={keyword ? `没有包含「${keyword}」的战队` : ''}
            />
          )}
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
