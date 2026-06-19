import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = '暂无数据',
  description = '',
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        color: '#6B7394',
        gap: 1.5,
      }}
    >
      {icon || <InboxOutlined sx={{ fontSize: 56, color: '#3A3F58' }} />}
      <Typography variant="h6" sx={{ color: '#6B7394' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: '#6B7394' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
