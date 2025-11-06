import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useVulnerabilityContext } from '../../context/VulnerabilityContext';
import { exportFilteredData } from '../../utils/exportUtils';

/**
 * Filter panel component with export functionality
 */
const FilterPanel: React.FC = () => {
  const { filteredData, data } = useVulnerabilityContext();

  const handleExport = (format: 'csv' | 'json') => {
    exportFilteredData(filteredData, format);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()}{' '}
            vulnerabilities
          </Typography>
          {filteredData.length < data.length && (
            <Typography variant="caption" color="primary">
              ({(data.length - filteredData.length).toLocaleString()} filtered out)
            </Typography>
          )}
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('json')}
          >
            Export JSON
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(FilterPanel);
