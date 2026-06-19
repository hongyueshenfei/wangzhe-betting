import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined, SportsEsports, SearchOff } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  inbox: <InboxOutlined sx={{ fontSize: 64, color: '#3A3F58' }} />,
  game: <SportsEsports sx={{ fontSize: 64, color: '#3A3F58' }} />,
  search: <SearchOff sx={{ fontSize: 64, color: '#3A3F58' }} />,
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  /** 可选的操作按钮 */
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  title = '暂无数据',
  description = '',
  icon,
  action,
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 2,
      }}
    >
      <Box sx={{
        width: 100, height: 100,
        borderRadius: '50%',
        bgcolor: '#1A1D2E',
        border: '1.5px solid #242840',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon || ICONS.inbox}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#8890A8', mt: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 13, color: '#8890A8', textAlign: 'center', maxWidth: 280 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (action.to) navigate(action.to);
            action.onClick?.();
          }}
          sx={{ mt: 1 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
