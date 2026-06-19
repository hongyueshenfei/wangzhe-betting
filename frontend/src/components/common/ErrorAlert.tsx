import { Alert, AlertTitle, Box, Button } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Box sx={{ py: 2 }}>
      <Alert
        severity="error"
        sx={{
          bgcolor: 'rgba(211,47,47,0.1)',
          color: '#EF5350',
          border: '1px solid rgba(211,47,47,0.3)',
          '& .MuiAlert-icon': { color: '#EF5350' },
          '& .MuiAlertTitle-root': { color: '#EF5350' },
        }}
      >
        <AlertTitle>出错了</AlertTitle>
        {message}
        {onRetry && (
          <Box sx={{ mt: 1 }}>
            <Button
              onClick={onRetry}
              sx={{
                color: '#C8A951',
                fontSize: 14,
                textTransform: 'none',
                textDecoration: 'underline',
                p: 0,
                minWidth: 'auto',
                '&:hover': { color: '#D4A843', bgcolor: 'transparent' },
              }}
            >
              重试
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
}
