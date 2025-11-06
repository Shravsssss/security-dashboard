import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { SmartToy as AIIcon, Person as PersonIcon } from '@mui/icons-material';

interface AIManualComparisonChartProps {
  data: VulnerabilityData[];
}

interface AnalysisStats {
  aiTotal: number;
  manualTotal: number;
  aiNoRisk: number;
  manualNoRisk: number;
  aiSeverityBreakdown: Record<string, number>;
  manualSeverityBreakdown: Record<string, number>;
}

const COLORS = {
  ai: '#2196f3',
  manual: '#ff9800',
  critical: '#f44336',
  high: '#ff9800',
  medium: '#2196f3',
  low: '#4caf50',
};

/**
 * AI vs Manual Analysis Comparison Visualization
 * Shows the relationship between AI and manual analysis results
 */
export const AIManualComparisonChart: React.FC<AIManualComparisonChartProps> = ({ data }) => {
  const analysisStats = useMemo((): AnalysisStats => {
    const stats: AnalysisStats = {
      aiTotal: 0,
      manualTotal: 0,
      aiNoRisk: 0,
      manualNoRisk: 0,
      aiSeverityBreakdown: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      manualSeverityBreakdown: { Critical: 0, High: 0, Medium: 0, Low: 0 },
    };

    data.forEach((item) => {
      // Identify AI analysis: kaiStatus starts with 'ai-'
      const isAI = item.kaiStatus?.toLowerCase().startsWith('ai-');

      if (isAI) {
        stats.aiTotal++;
        if (item.kaiStatus?.toLowerCase().includes('norisk') ||
            item.kaiStatus?.toLowerCase().includes('invalid')) {
          stats.aiNoRisk++;
        }
        stats.aiSeverityBreakdown[item.severity] = (stats.aiSeverityBreakdown[item.severity] || 0) + 1;
      } else {
        stats.manualTotal++;
        if (item.kaiStatus?.toLowerCase().includes('norisk') ||
            item.kaiStatus?.toLowerCase().includes('invalid')) {
          stats.manualNoRisk++;
        }
        stats.manualSeverityBreakdown[item.severity] = (stats.manualSeverityBreakdown[item.severity] || 0) + 1;
      }
    });

    return stats;
  }, [data]);

  // Pie chart data for AI vs Manual split
  const pieData = [
    { name: 'AI Analysis', value: analysisStats.aiTotal, color: COLORS.ai },
    { name: 'Manual Analysis', value: analysisStats.manualTotal, color: COLORS.manual },
  ];

  // Severity comparison data
  const severityComparisonData = ['Critical', 'High', 'Medium', 'Low'].map((severity) => ({
    severity,
    'AI Analysis': analysisStats.aiSeverityBreakdown[severity] || 0,
    'Manual Analysis': analysisStats.manualSeverityBreakdown[severity] || 0,
  }));

  // Calculate accuracy metrics
  const aiAcceptanceRate = analysisStats.aiTotal > 0
    ? ((analysisStats.aiTotal - analysisStats.aiNoRisk) / analysisStats.aiTotal * 100).toFixed(1)
    : '0';

  const manualAcceptanceRate = analysisStats.manualTotal > 0
    ? ((analysisStats.manualTotal - analysisStats.manualNoRisk) / analysisStats.manualTotal * 100).toFixed(1)
    : '0';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="body2">
            Count: {payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Percentage: {((payload[0].value / data.length) * 100).toFixed(1)}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          AI vs Manual Analysis Comparison
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No data available for comparison
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          AI vs Manual Analysis Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyzing the relationship between AI-powered and manual vulnerability assessments
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AIIcon color="primary" />
                <Typography variant="h6">AI Analysis</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {analysisStats.aiTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {((analysisStats.aiTotal / data.length) * 100).toFixed(1)}% of total
              </Typography>
              <Box mt={2}>
                <Chip
                  label={`Acceptance: ${aiAcceptanceRate}%`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonIcon sx={{ color: COLORS.manual }} />
                <Typography variant="h6">Manual Analysis</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: COLORS.manual }}>
                {analysisStats.manualTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {((analysisStats.manualTotal / data.length) * 100).toFixed(1)}% of total
              </Typography>
              <Box mt={2}>
                <Chip
                  label={`Acceptance: ${manualAcceptanceRate}%`}
                  size="small"
                  sx={{ color: COLORS.manual, borderColor: COLORS.manual }}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Marked Invalid
              </Typography>
              <Typography variant="h3" color="error">
                {analysisStats.aiNoRisk.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {analysisStats.aiTotal > 0
                  ? ((analysisStats.aiNoRisk / analysisStats.aiTotal) * 100).toFixed(1)
                  : '0'}% of AI analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manual Marked Invalid
              </Typography>
              <Typography variant="h3" color="error">
                {analysisStats.manualNoRisk.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {analysisStats.manualTotal > 0
                  ? ((analysisStats.manualNoRisk / analysisStats.manualTotal) * 100).toFixed(1)
                  : '0'}% of manually analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Donut Chart - AI vs Manual Split */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Analysis Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Severity Comparison Bar Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Severity Breakdown by Analysis Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="AI Analysis" fill={COLORS.ai} />
                <Bar dataKey="Manual Analysis" fill={COLORS.manual} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Insights */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ backgroundColor: 'action.hover' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Key Insights
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  • AI analysis covers <strong>{((analysisStats.aiTotal / data.length) * 100).toFixed(1)}%</strong> of all vulnerabilities
                </Typography>
                <Typography variant="body2">
                  • AI has a <strong>{aiAcceptanceRate}%</strong> acceptance rate vs Manual's <strong>{manualAcceptanceRate}%</strong>
                </Typography>
                <Typography variant="body2">
                  • <strong>{Math.abs(analysisStats.aiTotal - analysisStats.manualTotal).toLocaleString()}</strong> more vulnerabilities analyzed by {analysisStats.aiTotal > analysisStats.manualTotal ? 'AI' : 'Manual'} review
                </Typography>
                {analysisStats.aiTotal > 0 && analysisStats.manualTotal > 0 && (
                  <Typography variant="body2">
                    • Combined coverage: <strong>{data.length.toLocaleString()}</strong> total vulnerabilities assessed
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(AIManualComparisonChart);
