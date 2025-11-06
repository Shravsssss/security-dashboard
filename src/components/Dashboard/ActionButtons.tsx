import React from 'react';
import {
  Box,
  Button,
  Badge,
  Collapse,
  Fade,
  Typography,
  Paper,
  LinearProgress,
} from '@mui/material';
import { Security as SecurityIcon, SmartToy as SmartToyIcon } from '@mui/icons-material';
import { useVulnerabilityContext } from '../../context/VulnerabilityContext';

/**
 * Filter impact visualization component
 */
const FilterImpactVisualization: React.FC<{
  active: boolean;
  filtered: number;
  total: number;
}> = ({ active, filtered, total }) => {
  const percentage = total > 0 ? ((total - filtered) / total) * 100 : 0;

  return (
    <Collapse in={active}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 2,
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          borderLeft: 4,
          borderColor: 'primary.main',
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Filter Impact
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" fontWeight="bold">
            {percentage.toFixed(1)}% filtered
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {(total - filtered).toLocaleString()} of {total.toLocaleString()} vulnerabilities
          excluded
        </Typography>
      </Paper>
    </Collapse>
  );
};

/**
 * Action buttons component with Analysis and AI Analysis filters
 * Provides creative visual feedback when filters are applied
 */
const ActionButtons: React.FC = () => {
  const { filters, applyFilter, metrics, data, filteredData } = useVulnerabilityContext();

  const analysisActive = filters.excludeNoRisk;
  const aiAnalysisActive = filters.excludeAiNoRisk;

  const handleAnalysis = () => {
    applyFilter('excludeNoRisk', !analysisActive);
  };

  const handleAiAnalysis = () => {
    applyFilter('excludeAiNoRisk', !aiAnalysisActive);
  };

  return (
    <Box>
      <Box
        display="flex"
        gap={2}
        flexWrap="wrap"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        {/* Analysis Button */}
        <Fade in timeout={300}>
          <Badge
            badgeContent={metrics?.kaiStatusBreakdown['invalid-norisk'] || 0}
            color="primary"
            max={99999}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 22,
                minWidth: 22,
                padding: '0 6px',
              },
            }}
          >
            <Button
              variant={analysisActive ? 'contained' : 'outlined'}
              startIcon={<SecurityIcon />}
              onClick={handleAnalysis}
              size="large"
              sx={{
                transition: 'all 0.3s ease',
                transform: analysisActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: analysisActive ? 4 : 0,
                minWidth: 150,
              }}
            >
              Analysis
            </Button>
          </Badge>
        </Fade>

        {/* AI Analysis Button */}
        <Fade in timeout={400}>
          <Badge
            badgeContent={metrics?.kaiStatusBreakdown['ai-invalid-norisk'] || 0}
            color="secondary"
            max={99999}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 22,
                minWidth: 22,
                padding: '0 6px',
              },
            }}
          >
            <Button
              variant={aiAnalysisActive ? 'contained' : 'outlined'}
              startIcon={<SmartToyIcon />}
              onClick={handleAiAnalysis}
              size="large"
              color="secondary"
              sx={{
                transition: 'all 0.3s ease',
                transform: aiAnalysisActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: aiAnalysisActive ? 4 : 0,
                minWidth: 150,
              }}
            >
              AI Analysis
            </Button>
          </Badge>
        </Fade>

        {/* Status indicator */}
        {(analysisActive || aiAnalysisActive) && (
          <Fade in timeout={500}>
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: 'success.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="success.dark">
                {analysisActive && aiAnalysisActive
                  ? 'Both filters active'
                  : analysisActive
                  ? 'Analysis filter active'
                  : 'AI Analysis filter active'}
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Visual impact indicator */}
      <FilterImpactVisualization
        active={analysisActive || aiAnalysisActive}
        filtered={filteredData.length}
        total={data.length}
      />
    </Box>
  );
};

export default React.memo(ActionButtons);
