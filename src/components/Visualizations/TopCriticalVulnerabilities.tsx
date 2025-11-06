import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { getSeverityColorName } from '../../utils/severityUtils';
import { SEVERITY_ORDER } from '../../constants/severity';

interface TopCriticalVulnerabilitiesProps {
  data: VulnerabilityData[];
  topN?: number;
  onViewDetails?: (item: VulnerabilityData) => void;
}

/**
 * Top Critical Vulnerabilities Component
 * Highlights the most dangerous vulnerabilities requiring immediate attention
 * Sorted by severity and CVSS score
 */
export const TopCriticalVulnerabilities: React.FC<TopCriticalVulnerabilitiesProps> = ({
  data,
  topN = 10,
  onViewDetails,
}) => {
  // Calculate and sort the top critical vulnerabilities
  const topCritical = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate risk score for each vulnerability
    const scored = data.map((vuln) => {
      const severityWeight = SEVERITY_ORDER[vuln.severity.toLowerCase()] || 0;
      const cvssScore = vuln.cvss || 0;
      const riskFactorCount = vuln.riskFactors?.length || 0;

      // Combined risk score: severity (0-30) + CVSS (0-10) + risk factors (0-10)
      const riskScore = severityWeight * 10 + cvssScore + Math.min(riskFactorCount, 10);

      return { ...vuln, riskScore };
    });

    // Sort by risk score descending and take top N
    return scored
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, topN);
  }, [data, topN]);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <WarningIcon color="warning" fontSize="large" />
          <Typography variant="h6">Top Critical Vulnerabilities</Typography>
        </Box>
        <Alert severity="info" icon={<InfoIcon />}>
          No vulnerabilities to display
        </Alert>
      </Paper>
    );
  }

  const criticalCount = topCritical.filter((v) => v.severity.toLowerCase() === 'critical').length;
  const highCount = topCritical.filter((v) => v.severity.toLowerCase() === 'high').length;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <ErrorIcon color="error" fontSize="large" />
          <Box>
            <Typography variant="h6">Top {topN} Critical Vulnerabilities</Typography>
            <Typography variant="body2" color="text.secondary">
              Immediate attention required
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Chip
            label={`${criticalCount} Critical`}
            color="error"
            size="small"
            icon={<ErrorIcon />}
          />
          <Chip
            label={`${highCount} High`}
            color="warning"
            size="small"
            icon={<WarningIcon />}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Critical vulnerability cards */}
      <Stack spacing={2}>
        {topCritical.map((vuln, index) => (
          <Card
            key={vuln.id}
            sx={{
              border: '2px solid',
              borderColor:
                vuln.severity.toLowerCase() === 'critical'
                  ? 'error.main'
                  : vuln.severity.toLowerCase() === 'high'
                  ? 'warning.main'
                  : 'divider',
              backgroundColor:
                vuln.severity.toLowerCase() === 'critical'
                  ? 'rgba(211, 47, 47, 0.05)'
                  : vuln.severity.toLowerCase() === 'high'
                  ? 'rgba(237, 108, 2, 0.05)'
                  : 'background.paper',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color:
                        vuln.severity.toLowerCase() === 'critical'
                          ? 'error.main'
                          : vuln.severity.toLowerCase() === 'high'
                          ? 'warning.main'
                          : 'text.primary',
                    }}
                  >
                    #{index + 1}
                  </Typography>
                  <Typography variant="h6" noWrap sx={{ maxWidth: '400px' }}>
                    {vuln.package}
                  </Typography>
                </Box>
                <Chip
                  label={vuln.severity}
                  color={getSeverityColorName(vuln.severity)}
                  size="small"
                />
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                {vuln.cve && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      CVE ID
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {vuln.cve}
                    </Typography>
                  </Box>
                )}
                {vuln.cvss !== undefined && vuln.cvss !== null && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      CVSS Score
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={vuln.cvss >= 9 ? 'error.main' : vuln.cvss >= 7 ? 'warning.main' : 'text.primary'}
                    >
                      {vuln.cvss.toFixed(1)}
                    </Typography>
                  </Box>
                )}
                {vuln.version && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Version
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {vuln.version}
                    </Typography>
                  </Box>
                )}
                {vuln.riskFactors && vuln.riskFactors.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Risk Factors
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {vuln.riskFactors.length} identified
                    </Typography>
                  </Box>
                )}
              </Box>

              {vuln.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {vuln.description}
                </Typography>
              )}
            </CardContent>

            {onViewDetails && (
              <CardActions sx={{ justifyContent: 'flex-end', pb: 2, px: 2 }}>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => onViewDetails(vuln)}
                  variant="outlined"
                >
                  View Details
                </Button>
              </CardActions>
            )}
          </Card>
        ))}
      </Stack>

      {/* Summary footer */}
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight={600}>
          Action Required
        </Typography>
        <Typography variant="body2">
          These {topCritical.length} vulnerabilities represent the highest risk to your system.
          Review and remediate them as soon as possible.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default React.memo(TopCriticalVulnerabilities);
