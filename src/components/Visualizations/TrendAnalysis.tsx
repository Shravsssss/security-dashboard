import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Chip,
  Button,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { Download as DownloadIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import { VulnerabilityData } from '../../types/vulnerability.types';

interface TrendAnalysisProps {
  data: VulnerabilityData[];
}

/**
 * Enhanced trend analysis component with date range selection and cumulative view
 */
export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data }) => {
  const [dateRange, setDateRange] = useState<string>('30');
  const [isCumulative, setIsCumulative] = useState(false);
  const [showMovingAvg, setShowMovingAvg] = useState(false);
  const [visibleSeverities, setVisibleSeverities] = useState({
    critical: true,
    high: true,
    medium: true,
    low: true,
  });

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { data: [], insights: null };

    // Group by date
    const groupedByDate: Record<string, any> = {};

    data.forEach((item) => {
      // Use timestamp field (added by dataLoader from 'published' field)
      if (!item.timestamp) return;

      // Parse date - format is "2024-03-16 06:30:27" or ISO string
      let date: string;
      try {
        const dateObj = new Date(item.timestamp);
        if (isNaN(dateObj.getTime())) return; // Invalid date
        date = dateObj.toISOString().split('T')[0];
      } catch (e) {
        return; // Skip invalid dates
      }

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        };
      }

      groupedByDate[date].total++;
      const severity = item.severity.toLowerCase();
      if (severity in groupedByDate[date]) {
        groupedByDate[date][severity]++;
      }
    });

    // Sort by date
    const sorted = Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date));

    // Apply date range filter
    const daysToShow = parseInt(dateRange);
    let filtered = daysToShow > 0 ? sorted.slice(-daysToShow) : sorted;

    // Calculate insights
    const insights = {
      avgPerDay: filtered.length > 0 ? (filtered.reduce((sum, d) => sum + d.total, 0) / filtered.length).toFixed(1) : '0',
      busiestDay: filtered.length > 0 ? filtered.reduce((max, d) => d.total > max.total ? d : max, filtered[0]) : null,
      slowestDay: filtered.length > 0 ? filtered.reduce((min, d) => d.total < min.total ? d : min, filtered[0]) : null,
      trend: filtered.length > 7 ? (
        filtered.slice(-7).reduce((sum, d) => sum + d.total, 0) >
        filtered.slice(0, 7).reduce((sum, d) => sum + d.total, 0) ? 'up' : 'down'
      ) : 'stable',
    };

    // Apply cumulative calculation if enabled
    if (isCumulative && filtered.length > 0) {
      let cumulative = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      };

      filtered = filtered.map((day) => {
        cumulative.critical += day.critical;
        cumulative.high += day.high;
        cumulative.medium += day.medium;
        cumulative.low += day.low;
        cumulative.total += day.total;

        return {
          date: day.date,
          critical: cumulative.critical,
          high: cumulative.high,
          medium: cumulative.medium,
          low: cumulative.low,
          total: cumulative.total,
        };
      });
    }

    // Calculate 7-day moving average if enabled
    if (showMovingAvg && !isCumulative && filtered.length >= 7) {
      filtered = filtered.map((day, index) => {
        if (index < 6) return day;

        const window = filtered.slice(index - 6, index + 1);
        const avgCritical = window.reduce((sum, d) => sum + d.critical, 0) / 7;
        const avgHigh = window.reduce((sum, d) => sum + d.high, 0) / 7;
        const avgMedium = window.reduce((sum, d) => sum + d.medium, 0) / 7;
        const avgLow = window.reduce((sum, d) => sum + d.low, 0) / 7;

        return {
          ...day,
          avgCritical: Math.round(avgCritical),
          avgHigh: Math.round(avgHigh),
          avgMedium: Math.round(avgMedium),
          avgLow: Math.round(avgLow),
        };
      });
    }

    return { data: filtered, insights };
  }, [data, dateRange, isCumulative, showMovingAvg]);

  const handleExportCSV = () => {
    if (!chartData.data || chartData.data.length === 0) return;

    const headers = ['Date', 'Critical', 'High', 'Medium', 'Low', 'Total'];
    const rows = chartData.data.map(d => [
      d.date,
      d.critical,
      d.high,
      d.medium,
      d.low,
      d.total
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnerability-trends-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSeverity = (severity: keyof typeof visibleSeverities) => {
    setVisibleSeverities(prev => ({
      ...prev,
      [severity]: !prev[severity],
    }));
  };

  if (chartData.data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Vulnerability Trends Over Time
        </Typography>
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No trend data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const ChartComponent = isCumulative ? AreaChart : LineChart;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header with controls */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Vulnerability Trends Over Time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCumulative ? 'Cumulative' : 'Daily'} vulnerability discovery by severity
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Date range selector */}
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(e, value) => value && setDateRange(value)}
            size="small"
          >
            <ToggleButton value="7">7 days</ToggleButton>
            <ToggleButton value="30">30 days</ToggleButton>
            <ToggleButton value="90">90 days</ToggleButton>
            <ToggleButton value="0">All</ToggleButton>
          </ToggleButtonGroup>

          {/* Cumulative toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isCumulative}
                onChange={(e) => setIsCumulative(e.target.checked)}
                size="small"
              />
            }
            label="Cumulative"
          />
        </Box>
      </Box>

      {/* Stats chips and insights */}
      <Box display="flex" gap={1} mb={2} flexWrap="wrap" alignItems="center">
        <Chip
          label={`${chartData.data.length} days of data`}
          size="small"
        />
        {chartData.insights && (
          <>
            <Chip
              label={`Avg: ${chartData.insights.avgPerDay}/day`}
              size="small"
              color="primary"
            />
            {chartData.insights.trend === 'up' && (
              <Chip
                icon={<TrendingUp />}
                label="Trending Up"
                size="small"
                color="warning"
              />
            )}
            {chartData.insights.trend === 'down' && (
              <Chip
                icon={<TrendingDown />}
                label="Trending Down"
                size="small"
                color="success"
              />
            )}
          </>
        )}
        {isCumulative && chartData.data.length > 0 && (
          <Chip
            label={`Total: ${chartData.data[chartData.data.length - 1].total} vulnerabilities`}
            size="small"
            color="secondary"
          />
        )}
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          variant="outlined"
        >
          Export CSV
        </Button>
      </Box>

      {/* Severity toggles and moving average */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
        <Typography variant="caption" color="text.secondary">Show severities:</Typography>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox size="small" checked={visibleSeverities.critical} onChange={() => toggleSeverity('critical')} />}
            label={<Typography variant="caption">Critical</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={visibleSeverities.high} onChange={() => toggleSeverity('high')} />}
            label={<Typography variant="caption">High</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={visibleSeverities.medium} onChange={() => toggleSeverity('medium')} />}
            label={<Typography variant="caption">Medium</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={visibleSeverities.low} onChange={() => toggleSeverity('low')} />}
            label={<Typography variant="caption">Low</Typography>}
          />
        </FormGroup>
        {!isCumulative && chartData.data.length >= 7 && (
          <FormControlLabel
            control={
              <Switch
                checked={showMovingAvg}
                onChange={(e) => setShowMovingAvg(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="caption">7-day Moving Avg</Typography>}
          />
        )}
      </Box>

      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent
          data={chartData.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {isCumulative ? (
            <>
              {visibleSeverities.critical && (
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke="#f44336"
                  fill="#f44336"
                  fillOpacity={0.8}
                  name="Critical"
                />
              )}
              {visibleSeverities.high && (
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  stroke="#ff9800"
                  fill="#ff9800"
                  fillOpacity={0.8}
                  name="High"
                />
              )}
              {visibleSeverities.medium && (
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  stroke="#2196f3"
                  fill="#2196f3"
                  fillOpacity={0.8}
                  name="Medium"
                />
              )}
              {visibleSeverities.low && (
                <Area
                  type="monotone"
                  dataKey="low"
                  stackId="1"
                  stroke="#4caf50"
                  fill="#4caf50"
                  fillOpacity={0.8}
                  name="Low"
                />
              )}
            </>
          ) : (
            <>
              {visibleSeverities.critical && (
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#f44336"
                  strokeWidth={2}
                  name="Critical"
                  dot={{ r: 3 }}
                />
              )}
              {visibleSeverities.high && (
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#ff9800"
                  strokeWidth={2}
                  name="High"
                  dot={{ r: 3 }}
                />
              )}
              {visibleSeverities.medium && (
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#2196f3"
                  strokeWidth={2}
                  name="Medium"
                  dot={{ r: 3 }}
                />
              )}
              {visibleSeverities.low && (
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name="Low"
                  dot={{ r: 3 }}
                />
              )}
              {showMovingAvg && chartData.data.length >= 7 && (
                <>
                  {visibleSeverities.critical && (
                    <Line
                      type="monotone"
                      dataKey="avgCritical"
                      stroke="#f44336"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Critical (7-day avg)"
                      dot={false}
                    />
                  )}
                  {visibleSeverities.high && (
                    <Line
                      type="monotone"
                      dataKey="avgHigh"
                      stroke="#ff9800"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="High (7-day avg)"
                      dot={false}
                    />
                  )}
                </>
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Paper>
  );
};

export default React.memo(TrendAnalysis);
