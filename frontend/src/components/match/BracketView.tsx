import { Box, Typography } from '@mui/material';
import BracketNode from './BracketNode';
import type { MatchItem } from '../../types';

interface BracketViewProps {
  matches: MatchItem[];
}

/**
 * Recursively build a knockout bracket tree from matches.
 * Matches are grouped by round and ordered by matchOrder.
 */
export default function BracketView({ matches }: BracketViewProps) {
  // Group matches by round
  const roundMap = new Map<string, MatchItem[]>();
  for (const match of matches) {
    const round = match.round || '淘汰赛';
    if (!roundMap.has(round)) {
      roundMap.set(round, []);
    }
    roundMap.get(round)!.push(match);
  }

  // Sort rounds: assume order: 半决赛, 决赛
  const roundOrder = ['半决赛', '决赛'];
  const sortedRounds = Array.from(roundMap.entries()).sort((a, b) => {
    const aIdx = roundOrder.indexOf(a[0]);
    const bIdx = roundOrder.indexOf(b[0]);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  if (sortedRounds.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#8890A8' }}>暂无淘汰赛数据</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto', py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 4,
          minWidth: 'max-content',
          justifyContent: 'center',
        }}
      >
        {sortedRounds.map(([round, roundMatches]) => (
          <Box
            key={round}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: 200,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#C8A951', mb: 1 }}>
              {round}
            </Typography>
            {roundMatches
              .sort((a, b) => (a.matchOrder || 0) - (b.matchOrder || 0))
              .map((match) => (
                <BracketNode key={match.id} match={match} />
              ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
