import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { VulnerabilityMetrics } from '../../types/vulnerability.types';

interface RiskFactorsFrequencyProps {
  metrics: VulnerabilityMetrics | undefined;
  topN?: number;
}

/**
 * Risk factors frequency bar chart component
 */
export const RiskFactorsFrequency: React.FC<RiskFactorsFrequencyProps> = ({
  metrics,
  topN = 10,
}) => {
  const chartData = useMemo(() => {
    if (!metrics || !metrics.riskFactorsFrequency) return [];

    // Sort by frequency and take top N
    const sorted = Object.entries(metrics.riskFactorsFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN);

    return sorted.map(([name, count]) => ({
      name: name.length > 25 ? name.substring(0, 25) + '...' : name,
      fullName: name,
      count,
    }));
  }, [metrics, topN]);

  if (!metrics || chartData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Risk Factors
        </Typography>
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No risk factors data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {data.fullName}
          </Typography>
          <Typography variant="body2">
            Occurrences: {data.count.toLocaleString()}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Top {topN} Risk Factors
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="count" fill="#1976d2" name="Occurrences" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default React.memo(RiskFactorsFrequency);
