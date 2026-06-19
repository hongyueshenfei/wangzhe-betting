import { Grid } from '@mui/material';
import MatchCard from './MatchCard';
import EmptyState from '../common/EmptyState';
import type { MatchItem } from '../../types';

interface MatchListProps {
  matches: MatchItem[];
  betMatchIds?: Set<number>;
}

export default function MatchList({ matches, betMatchIds }: MatchListProps) {
  if (matches.length === 0) {
    return <EmptyState title="暂无比赛" description="当前没有符合条件的比赛" />;
  }

  return (
    <Grid container spacing={3}>
      {matches.map((match) => (
        <Grid item xs={12} sm={6} md={4} key={match.id}>
          <MatchCard match={match} hasBet={betMatchIds?.has(match.id)} />
        </Grid>
      ))}
    </Grid>
  );
}
