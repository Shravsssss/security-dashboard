import React, { useMemo } from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { SEVERITIES } from '../../constants/severity';

interface PackageSeverityHeatmapProps {
  data: VulnerabilityData[];
  topN?: number;
}

interface HeatmapDataPoint {
  package: string;
  severity: string;
  count: number;
  packageIndex: number;
  severityIndex: number;
}

const getSeverityColor = (count: number, maxCount: number) => {
  const intensity = Math.min(count / maxCount, 1);

  // Color scale from light to dark red
  const r = Math.floor(255);
  const g = Math.floor(255 * (1 - intensity * 0.9));
  const b = Math.floor(255 * (1 - intensity * 0.9));

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Package Severity Heatmap - Shows vulnerability distribution across packages and severity levels
 * Uses scatter chart to create a heatmap effect
 */
export const PackageSeverityHeatmap: React.FC<PackageSeverityHeatmapProps> = ({
  data,
  topN = 15,
}) => {
  // Process data for heatmap
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return { data: [], packages: [], maxCount: 0 };

    // Aggregate by package and severity
    const packageSeverityMap = new Map<string, Map<string, number>>();

    data.forEach((vuln) => {
      if (!packageSeverityMap.has(vuln.package)) {
        packageSeverityMap.set(vuln.package, new Map());
      }
      const severityMap = packageSeverityMap.get(vuln.package)!;
      severityMap.set(vuln.severity, (severityMap.get(vuln.severity) || 0) + 1);
    });

    // Get total count per package
    const packageTotals = Array.from(packageSeverityMap.entries()).map(([pkg, severityMap]) => {
      const total = Array.from(severityMap.values()).reduce((a, b) => a + b, 0);
      return { package: pkg, total };
    });

    // Sort and get top N packages
    const topPackages = packageTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, topN)
      .map((p) => p.package);

    // Create heatmap data points
    const heatmapPoints: HeatmapDataPoint[] = [];
    let maxCount = 0;

    topPackages.forEach((pkg, packageIndex) => {
      const severityMap = packageSeverityMap.get(pkg)!;
      SEVERITIES.forEach((severity, severityIndex) => {
        const count = severityMap.get(severity) || 0;
        maxCount = Math.max(maxCount, count);
        heatmapPoints.push({
          package: pkg,
          severity,
          count,
          packageIndex,
          severityIndex,
        });
      });
    });

    return {
      data: heatmapPoints,
      packages: topPackages,
      maxCount,
    };
  }, [data, topN]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HeatmapDataPoint;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {data.package}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.severity}: {data.count} vulnerabilities
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Package × Severity Heatmap
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No data available for visualization
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Package × Severity Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vulnerability distribution across top packages by severity level
        </Typography>
      </Box>

      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Chip label={`Top ${heatmapData.packages.length} packages`} size="small" />
        <Chip
          label={`Max ${heatmapData.maxCount} vulnerabilities per cell`}
          size="small"
          color="secondary"
        />
      </Box>

      <ResponsiveContainer width="100%" height={Math.min(600, Math.max(400, heatmapData.packages.length * 30 + 100))}>
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 80, left: 150 }}
        >
          <XAxis
            type="number"
            dataKey="severityIndex"
            name="Severity"
            domain={[-0.5, SEVERITIES.length - 0.5]}
            ticks={SEVERITIES.map((_, i) => i)}
            tickFormatter={(index) => SEVERITIES[index] || ''}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis
            type="number"
            dataKey="packageIndex"
            name="Package"
            domain={[-0.5, heatmapData.packages.length - 0.5]}
            ticks={heatmapData.packages.map((_, i) => i)}
            tickFormatter={(index) => heatmapData.packages[index] || ''}
            tick={{ fontSize: 11 }}
            tickLine={{ stroke: '#666' }}
            width={180}
            reversed
          />
          <ZAxis
            type="number"
            dataKey="count"
            range={[300, 500]}
            name="Count"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={heatmapData.data} shape="square">
            {heatmapData.data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.count === 0
                    ? '#f5f5f5'
                    : getSeverityColor(entry.count, heatmapData.maxCount)
                }
                stroke={entry.count === 0 ? '#e0e0e0' : '#fff'}
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <Box mt={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Color intensity:
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Box width={20} height={12} bgcolor="#ffffff" border="1px solid #e0e0e0" />
          <Typography variant="caption">0 (None)</Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Box
            width={20}
            height={12}
            bgcolor={getSeverityColor(Math.floor(heatmapData.maxCount * 0.3), heatmapData.maxCount)}
          />
          <Typography variant="caption">Low</Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Box
            width={20}
            height={12}
            bgcolor={getSeverityColor(Math.floor(heatmapData.maxCount * 0.6), heatmapData.maxCount)}
          />
          <Typography variant="caption">Medium</Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Box width={20} height={12} bgcolor={getSeverityColor(heatmapData.maxCount, heatmapData.maxCount)} />
          <Typography variant="caption">High</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(PackageSeverityHeatmap);
