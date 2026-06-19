import { Box, Paper, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  noPadding?: boolean;
  noMargin?: boolean;
}

/**
 * 统一卡片容器组件 — 替代重复的 Paper sx 模板
 *
 * 默认：bgcolor=#1A1D2E, border=1px solid #1E2340, p={xs:2,sm:3}, mb=3
 * 通过 theme.components.MuiPaper 配置默认值
 */
export default function SectionCard({ children, sx, noPadding, noMargin }: SectionCardProps) {
  return (
    <Paper
      sx={{
        ...(noPadding ? {} : { p: { xs: 2, sm: 3 } }),
        ...(noMargin ? {} : { mb: 3 }),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

/**
 * 并排双栏容器 — 用于左右对比区块
 */
export function SplitPanel({ left, right, sx }: { left: ReactNode; right: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 1.5, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        ...sx,
      }}
    >
      <Box sx={{ flex: 1 }}>{left}</Box>
      <Box sx={{ flex: 1 }}>{right}</Box>
    </Box>
  );
}

/**
 * 卡片标题 — 复用的标题样式
 */
export function CardTitle({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="h3"
      sx={{
        mb: 2,
        fontWeight: 700,
        color: '#E8EAF0',
        fontSize: { xs: 14, sm: 16 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
