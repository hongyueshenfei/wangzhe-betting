import { Box, Typography } from '@mui/material';
import { formatOdds } from '../../utils/format';

interface OddsDisplayProps {
  teamAName: string;
  teamBName: string;
  oddsA: number;
  oddsB: number;
  betTotalA?: number;
  betTotalB?: number;
}

export default function OddsDisplay({
  teamAName,
  teamBName,
  oddsA,
  oddsB,
  betTotalA = 0,
  betTotalB = 0,
}: OddsDisplayProps) {
  const total = betTotalA + betTotalB;
  const ratioA = total > 0 ? Math.round((betTotalA / total) * 100) : 50;
  const ratioB = 100 - ratioA;

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 3 } }}>
      {/* Team A */}
      <Box sx={{
        flex: 1, bgcolor: '#0F1119', borderRadius: 2, p: { xs: 2, sm: 2.5 },
        border: '1px solid rgba(66,165,245,0.2)',
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 16 }, color: '#42A5F5', mb: 1.5 }}>
          {teamAName}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <OddsRow label="赔率" value={formatOdds(oddsA)} highlight />
          <OddsRow label="投注总额" value={`${betTotalA} 币`} />
          <OddsRow label="投注占比" value={`${ratioA}%`} />
        </Box>
        {/* Mini bar */}
        <Box sx={{
          mt: 1.5, width: '100%', height: 4,
          bgcolor: '#2A2F45', borderRadius: 2, overflow: 'hidden',
        }}>
          <Box sx={{ height: '100%', bgcolor: '#42A5F5', borderRadius: 2 }}
            style={{ width: `${ratioA}%` }} />
        </Box>
      </Box>

      {/* VS 分隔 */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 800, color: '#C8A951' }}>
          VS
        </Typography>
      </Box>

      {/* Team B */}
      <Box sx={{
        flex: 1, bgcolor: '#0F1119', borderRadius: 2, p: { xs: 2, sm: 2.5 },
        border: '1px solid rgba(239,83,80,0.2)',
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 16 }, color: '#EF5350', mb: 1.5 }}>
          {teamBName}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <OddsRow label="赔率" value={formatOdds(oddsB)} highlight />
          <OddsRow label="投注总额" value={`${betTotalB} 币`} />
          <OddsRow label="投注占比" value={`${ratioB}%`} />
        </Box>
        {/* Mini bar */}
        <Box sx={{
          mt: 1.5, width: '100%', height: 4,
          bgcolor: '#2A2F45', borderRadius: 2, overflow: 'hidden',
        }}>
          <Box sx={{ height: '100%', bgcolor: '#EC407A', borderRadius: 2 }}
            style={{ width: `${ratioB}%` }} />
        </Box>
      </Box>
    </Box>
  );
}

function OddsRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#8890A8' }}>{label}</Typography>
      <Typography sx={{
        fontSize: { xs: 13, sm: 14 }, fontWeight: highlight ? 800 : 600,
        color: highlight ? '#C8A951' : '#E8EAF0',
      }}>{value}</Typography>
    </Box>
  );
}
