import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { getSeverityColorName } from '../../utils/severityUtils';

interface ComparisonViewProps {
  selectedVulnerabilities: VulnerabilityData[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

/**
 * Comparison view component for side-by-side vulnerability comparison
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
  selectedVulnerabilities,
  onRemove,
  onClear,
}) => {
  if (selectedVulnerabilities.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CompareArrowsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Vulnerabilities Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select vulnerabilities from the list to compare them side by side
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <CompareArrowsIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Comparison View
          </Typography>
          <Chip
            label={`${selectedVulnerabilities.length} selected`}
            color="primary"
            size="small"
          />
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClear}
          startIcon={<CloseIcon />}
        >
          Clear All
        </Button>
      </Box>

      {/* Info alert */}
      {selectedVulnerabilities.length > 4 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing {selectedVulnerabilities.length} vulnerabilities. Consider comparing fewer
          items for better readability.
        </Alert>
      )}

      {/* Comparison grid */}
      <Grid container spacing={3}>
        {selectedVulnerabilities.map((vuln) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={vuln.id}>
            <Card
              elevation={4}
              sx={{
                height: '100%',
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              {/* Remove button */}
              <IconButton
                size="small"
                onClick={() => onRemove(vuln.id)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <CardContent>
                {/* Package name */}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 4,
                  }}
                  title={vuln.package}
                >
                  {vuln.package}
                </Typography>

                {/* Severity badge */}
                <Box mb={2}>
                  <Chip
                    label={vuln.severity}
                    color={getSeverityColorName(vuln.severity)}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Details */}
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {vuln.version && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Version
                      </Typography>
                      <Typography variant="body2">{vuln.version}</Typography>
                    </Box>
                  )}

                  {vuln.cve && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        CVE
                      </Typography>
                      <Typography variant="body2">{vuln.cve}</Typography>
                    </Box>
                  )}

                  {vuln.cvss !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        CVSS Score
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {vuln.cvss}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      KAI Status
                    </Typography>
                    <Typography variant="body2" fontSize="0.85rem">
                      {vuln.kaiStatus}
                    </Typography>
                  </Box>

                  {/* Risk factors */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Risk Factors ({vuln.riskFactors?.length || 0})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {vuln.riskFactors && vuln.riskFactors.length > 0 ? (
                        vuln.riskFactors.slice(0, 3).map((factor, index) => (
                          <Chip
                            key={index}
                            label={factor.length > 15 ? factor.substring(0, 15) + '...' : factor}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                          None
                        </Typography>
                      )}
                      {vuln.riskFactors && vuln.riskFactors.length > 3 && (
                        <Chip
                          label={`+${vuln.riskFactors.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ComparisonView;
