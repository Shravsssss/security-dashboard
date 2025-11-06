import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { VulnerabilityMetrics } from '../../types/vulnerability.types';

interface SeverityDistributionProps {
  metrics: VulnerabilityMetrics | undefined;
}

const COLORS = {
  critical: '#f44336',
  high: '#ff9800',
  medium: '#ffeb3b',
  low: '#4caf50',
};

/**
 * Severity distribution pie chart component
 */
export const SeverityDistribution: React.FC<SeverityDistributionProps> = ({ metrics }) => {
  const chartData = useMemo(() => {
    if (!metrics) return [];

    const { severityDistribution } = metrics;

    return [
      { name: 'Critical', value: severityDistribution.critical, color: COLORS.critical },
      { name: 'High', value: severityDistribution.high, color: COLORS.high },
      { name: 'Medium', value: severityDistribution.medium, color: COLORS.medium },
      { name: 'Low', value: severityDistribution.low, color: COLORS.low },
    ].filter((item) => item.value > 0); // Only show non-zero values
  }, [metrics]);

  if (!metrics || chartData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Severity Distribution
        </Typography>
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / metrics.total) * 100).toFixed(1);
      return (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2">
            Count: {data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2">Percentage: {percentage}%</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Severity Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.name}: ${entry.value}`}
            labelLine
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default React.memo(SeverityDistribution);
