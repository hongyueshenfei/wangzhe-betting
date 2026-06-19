import { Box, Skeleton } from '@mui/material';

/**
 * 比赛卡片骨架屏 — 用于 MatchList 加载态
 */
export function MatchCardSkeleton() {
  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #1A1D2E, #1F2342)',
      borderRadius: 3, p: 2, border: '1px solid #242840', mb: 2,
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Skeleton variant="rounded" width={80} height={18} sx={{ bgcolor: '#2A2F45' }} />
        <Skeleton variant="rounded" width={50} height={18} sx={{ bgcolor: '#2A2F45' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ bgcolor: '#2A2F45', borderRadius: 1.5 }} />
          <Skeleton variant="text" width={60} height={16} sx={{ bgcolor: '#2A2F45' }} />
          <Skeleton variant="rounded" width={70} height={22} sx={{ bgcolor: '#2A2F45', borderRadius: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
          <Skeleton variant="text" width={28} height={24} sx={{ bgcolor: '#2A2F45' }} />
          <Skeleton variant="text" width={80} height={12} sx={{ bgcolor: '#2A2F45' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ bgcolor: '#2A2F45', borderRadius: 1.5 }} />
          <Skeleton variant="text" width={60} height={16} sx={{ bgcolor: '#2A2F45' }} />
          <Skeleton variant="rounded" width={70} height={22} sx={{ bgcolor: '#2A2F45', borderRadius: 1 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Skeleton variant="rounded" width={100} height={34} sx={{ bgcolor: '#2A2F45', borderRadius: 1.5 }} />
      </Box>
    </Box>
  );
}

/**
 * 排行榜骨架屏
 */
export function RankListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, px: 1.5, mb: 0.5 }}>
          <Skeleton variant="rounded" width={28} height={28} sx={{ bgcolor: '#2A2F45' }} />
          <Skeleton variant="circular" width={34} height={34} sx={{ bgcolor: '#2A2F45' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={80} height={14} sx={{ bgcolor: '#2A2F45' }} />
            <Skeleton variant="text" width={120} height={12} sx={{ bgcolor: '#2A2F45' }} />
          </Box>
          <Skeleton variant="text" width={60} height={18} sx={{ bgcolor: '#2A2F45' }} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * 文本卡片骨架屏
 */
export function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Box sx={{ bgcolor: '#1A1D2E', borderRadius: 3, p: 3, border: '1px solid #1E2340', mb: 3 }}>
      <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: '#2A2F45', mb: 2 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" sx={{ bgcolor: '#2A2F45', mb: 0.5 }} width={`${90 - i * 20}%`} />
      ))}
    </Box>
  );
}
