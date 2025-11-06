import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

interface ChartVisibility {
  riskScoring: boolean;
  aiManualComparison: boolean;
  severityDistribution: boolean;
  riskFactorsFrequency: boolean;
  trendAnalysis: boolean;
  packageHeatmap: boolean;
  dependencyNetwork: boolean;
}

interface DashboardSettings {
  themeMode: 'light' | 'dark';
  chartVisibility: ChartVisibility;
}

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  toggleChart: (chartKey: keyof ChartVisibility) => void;
  toggleTheme: () => void;
  resetSettings: () => void;
}

const defaultSettings: DashboardSettings = {
  themeMode: 'light',
  chartVisibility: {
    riskScoring: true,
    aiManualComparison: true,
    severityDistribution: true,
    riskFactorsFrequency: true,
    trendAnalysis: true,
    packageHeatmap: true,
    dependencyNetwork: true,
  },
};

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(
  undefined
);

export const useDashboardSettings = () => {
  const context = useContext(DashboardSettingsContext);
  if (!context) {
    throw new Error('useDashboardSettings must be used within DashboardSettingsProvider');
  }
  return context;
};

interface DashboardSettingsProviderProps {
  children: ReactNode;
}

export const DashboardSettingsProvider: React.FC<DashboardSettingsProviderProps> = ({
  children,
}) => {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    try {
      const saved = localStorage.getItem('dashboardSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save dashboard settings:', error);
    }
  }, [settings]);

  const toggleChart = (chartKey: keyof ChartVisibility) => {
    setSettings((prev) => ({
      ...prev,
      chartVisibility: {
        ...prev.chartVisibility,
        [chartKey]: !prev.chartVisibility[chartKey],
      },
    }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      themeMode: prev.themeMode === 'light' ? 'dark' : 'light',
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Create MUI theme based on settings
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: settings.themeMode,
          primary: {
            main: settings.themeMode === 'light' ? '#1976d2' : '#90caf9',
          },
          secondary: {
            main: settings.themeMode === 'light' ? '#dc004e' : '#f48fb1',
          },
        },
      }),
    [settings.themeMode]
  );

  return (
    <DashboardSettingsContext.Provider
      value={{
        settings,
        toggleChart,
        toggleTheme,
        resetSettings,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </DashboardSettingsContext.Provider>
  );
};
