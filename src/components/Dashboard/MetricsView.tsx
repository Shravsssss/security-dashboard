import React from 'react';
import { Box, Grid, Paper, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import {
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { VulnerabilityMetrics } from '../../types/vulnerability.types';

interface MetricsViewProps {
  metrics: VulnerabilityMetrics | undefined;
  isLoading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle, tooltip }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="h3" fontWeight="bold" color={color}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

/**
 * Metrics overview component displaying key vulnerability statistics
 */
const MetricsView: React.FC<MetricsViewProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          Loading metrics...
        </Typography>
      </Box>
    );
  }

  if (!metrics) {
    return null;
  }

  const { total, severityDistribution, kaiStatusBreakdown } = metrics;

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Security Overview
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Total Vulnerabilities */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Vulnerabilities"
            value={total}
            icon={<BugReportIcon fontSize="large" />}
            color="#1976d2"
            tooltip="Total count of all security vulnerabilities found in scanned packages"
          />
        </Grid>

        {/* Critical */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Critical"
            value={severityDistribution.critical}
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
            subtitle={`${((severityDistribution.critical / total) * 100).toFixed(1)}% of total`}
            tooltip="Vulnerabilities with Critical severity rating (CVSS 9.0-10.0) - require immediate attention"
          />
        </Grid>

        {/* High */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="High"
            value={severityDistribution.high}
            icon={<WarningIcon fontSize="large" />}
            color="#ed6c02"
            subtitle={`${((severityDistribution.high / total) * 100).toFixed(1)}% of total`}
            tooltip="Vulnerabilities with High severity rating (CVSS 7.0-8.9) - should be prioritized"
          />
        </Grid>

        {/* Medium + Low */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Medium & Low"
            value={severityDistribution.medium + severityDistribution.low}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#2e7d32"
            subtitle={`${(
              ((severityDistribution.medium + severityDistribution.low) / total) *
              100
            ).toFixed(1)}% of total`}
            tooltip="Combined count of Medium (CVSS 4.0-6.9) and Low (CVSS 0.1-3.9) severity vulnerabilities"
          />
        </Grid>
      </Grid>

      {/* KAI Status Breakdown */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" gutterBottom sx={{ flex: 1, mb: 0 }}>
            KAI Status Breakdown
          </Typography>
          <Tooltip
            title="KAI (Known-vulnerability Automated Invalidation) status indicates whether vulnerabilities have been assessed and categorized by automated analysis or AI systems"
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
          <Tooltip title="Vulnerabilities marked as invalid with no security risk through standard analysis" arrow>
            <Chip
              icon={<SecurityIcon />}
              label={`Invalid - No Risk: ${kaiStatusBreakdown['invalid-norisk'].toLocaleString()}`}
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.9rem', py: 2.5, cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Vulnerabilities marked as invalid with no security risk through AI-powered analysis" arrow>
            <Chip
              icon={<SecurityIcon />}
              label={`AI Invalid - No Risk: ${kaiStatusBreakdown['ai-invalid-norisk'].toLocaleString()}`}
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.9rem', py: 2.5, cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Vulnerabilities with other KAI statuses requiring further review" arrow>
            <Chip
              label={`Other: ${kaiStatusBreakdown.other.toLocaleString()}`}
              color="default"
              variant="outlined"
              sx={{ fontSize: '0.9rem', py: 2.5, cursor: 'pointer' }}
            />
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(MetricsView);
