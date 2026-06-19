import { Chip } from '@mui/material';

interface CoinDisplayProps {
  coins: number;
  size?: 'small' | 'medium';
}

export default function CoinDisplay({ coins, size = 'medium' }: CoinDisplayProps) {
  return (
    <Chip
      label={`💰 ${coins} 币`}
      size={size}
      sx={{
        bgcolor: 'rgba(200,169,81,0.1)',
        color: '#C8A951',
        fontWeight: 600,
        border: '1px solid rgba(200,169,81,0.3)',
      }}
    />
  );
}
