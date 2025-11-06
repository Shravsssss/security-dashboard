import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { useDashboardSettings } from '../../context/DashboardSettingsContext';

interface DashboardSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const chartLabels: Record<string, string> = {
  riskScoring: 'Risk Scoring Dashboard',
  aiManualComparison: 'AI vs Manual Analysis',
  severityDistribution: 'Severity Distribution',
  riskFactorsFrequency: 'Risk Factors Frequency',
  trendAnalysis: 'Trend Analysis',
  packageHeatmap: 'Package Severity Heatmap',
  dependencyNetwork: 'Dependency Network Graph',
};

export const DashboardSettingsDialog: React.FC<DashboardSettingsDialogProps> = ({
  open,
  onClose,
}) => {
  const { settings, toggleChart, toggleTheme, resetSettings } = useDashboardSettings();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Dashboard Settings</Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Theme Settings */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Theme
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose your preferred color theme
          </Typography>
          <ToggleButtonGroup
            value={settings.themeMode}
            exclusive
            onChange={toggleTheme}
            aria-label="theme mode"
            fullWidth
            sx={{ mt: 1 }}
          >
            <ToggleButton value="light" aria-label="light mode">
              <LightModeIcon sx={{ mr: 1 }} />
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
              <DarkModeIcon sx={{ mr: 1 }} />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Chart Visibility Settings */}
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Visible Charts
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select which visualizations to display on the dashboard
          </Typography>

          <FormGroup sx={{ mt: 2 }}>
            {Object.entries(settings.chartVisibility).map(([key, value]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={value}
                    onChange={() => toggleChart(key as keyof typeof settings.chartVisibility)}
                  />
                }
                label={chartLabels[key] || key}
              />
            ))}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Reset Button */}
        <Box>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            fullWidth
          >
            Reset to Defaults
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardSettingsDialog;
