import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Tabs,
  Tab,
  Paper,
  AppBar,
  Toolbar,
  Backdrop,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  CompareArrows as CompareIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useVulnerabilityContext } from '../../context/VulnerabilityContext';
import { useDashboardSettings } from '../../context/DashboardSettingsContext';
import MetricsView from './MetricsView';
import ActionButtons from './ActionButtons';
import DashboardSettingsDialog from './DashboardSettingsDialog';
import VirtualizedTable from '../VulnerabilityList/VirtualizedTable';
import DetailView from '../VulnerabilityList/DetailView';
import SearchInterface from '../SearchFilter/SearchInterface';
import FilterPanel from '../SearchFilter/FilterPanel';
import ComparisonView from '../Comparison/ComparisonView';
import SeverityDistribution from '../Visualizations/SeverityDistribution';
import RiskFactorsFrequency from '../Visualizations/RiskFactorsFrequency';
import TrendAnalysis from '../Visualizations/TrendAnalysis';
import DependencyNetworkGraph from '../Visualizations/DependencyNetworkGraph';
import PackageSeverityHeatmap from '../Visualizations/PackageSeverityHeatmap';
import RiskScoringDashboard from '../Visualizations/RiskScoringDashboard';
import AIManualComparisonChart from '../Visualizations/AIManualComparisonChart';
import TopCriticalVulnerabilities from '../Visualizations/TopCriticalVulnerabilities';
import { VulnerabilityData } from '../../types/vulnerability.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Main dashboard component - brings together all features
 */
export const MainDashboard: React.FC = () => {
  const { data, filteredData, metrics, isLoading, isFiltering, isError, error, selectedTab, setSelectedTab } = useVulnerabilityContext();
  const { settings } = useDashboardSettings();
  const [selectedVulnerability, setSelectedVulnerability] = useState<VulnerabilityData | null>(
    null
  );
  const [comparisonList, setComparisonList] = useState<VulnerabilityData[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRowClick = (item: VulnerabilityData) => {
    setSelectedVulnerability(item);
  };

  const handleCloseDetail = () => {
    setSelectedVulnerability(null);
  };

  const handleAddToComparison = (item: VulnerabilityData) => {
    if (!comparisonList.find((v) => v.id === item.id)) {
      setComparisonList([...comparisonList, item]);
    }
  };

  const handleRemoveFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter((v) => v.id !== id));
  };

  const handleClearComparison = () => {
    setComparisonList([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading vulnerability data...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a moment for large datasets
        </Typography>
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body2">{error?.message || 'An unknown error occurred'}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Security Vulnerability Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {data.length.toLocaleString()} vulnerabilities loaded
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setSettingsOpen(true)}
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
            <Tab icon={<ListIcon />} label="Vulnerability List" iconPosition="start" />
            <Tab
              icon={<CompareIcon />}
              label={`Compare (${comparisonList.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Metrics - Always visible across all tabs */}
        <MetricsView metrics={metrics} isLoading={isLoading} />

        {/* Dashboard Tab */}
        <TabPanel value={selectedTab} index={0}>
          {/* Action Buttons */}
          <Box mt={4}>
            <ActionButtons />
          </Box>

          {/* Top Critical Vulnerabilities - Always Visible */}
          <Box mt={4}>
            <TopCriticalVulnerabilities
              data={data}
              topN={10}
              onViewDetails={handleRowClick}
            />
          </Box>

          {/* Visualizations */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Risk Scoring Dashboard - Full Width Priority */}
            {settings.chartVisibility.riskScoring && (
              <Grid size={{ xs: 12 }}>
                <RiskScoringDashboard data={data} />
              </Grid>
            )}

            {/* AI vs Manual Analysis Comparison */}
            {settings.chartVisibility.aiManualComparison && (
              <Grid size={{ xs: 12 }}>
                <AIManualComparisonChart data={data} />
              </Grid>
            )}

            {/* Severity Distribution */}
            {settings.chartVisibility.severityDistribution && (
              <Grid size={{ xs: 12, md: 6 }}>
                <SeverityDistribution metrics={metrics} />
              </Grid>
            )}

            {/* Risk Factors Frequency */}
            {settings.chartVisibility.riskFactorsFrequency && (
              <Grid size={{ xs: 12, md: 6 }}>
                <RiskFactorsFrequency metrics={metrics} topN={10} />
              </Grid>
            )}

            {/* Enhanced Trend Analysis */}
            {settings.chartVisibility.trendAnalysis && (
              <Grid size={{ xs: 12 }}>
                <TrendAnalysis data={data} />
              </Grid>
            )}

            {/* Package Severity Heatmap */}
            {settings.chartVisibility.packageHeatmap && (
              <Grid size={{ xs: 12 }} sx={{ overflow: 'hidden' }}>
                <PackageSeverityHeatmap data={data} topN={15} />
              </Grid>
            )}

            {/* Dependency Network Graph */}
            {settings.chartVisibility.dependencyNetwork && (
              <Grid size={{ xs: 12 }}>
                <DependencyNetworkGraph data={data} maxNodes={25} />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Vulnerability List Tab */}
        <TabPanel value={selectedTab} index={1}>
          <SearchInterface />
          <FilterPanel />
          <VirtualizedTable
            data={filteredData}
            onRowClick={handleRowClick}
            onAddToComparison={handleAddToComparison}
            comparisonList={comparisonList}
          />
        </TabPanel>

        {/* Comparison Tab */}
        <TabPanel value={selectedTab} index={2}>
          <ComparisonView
            selectedVulnerabilities={comparisonList}
            onRemove={handleRemoveFromComparison}
            onClear={handleClearComparison}
          />
        </TabPanel>
      </Container>

      {/* Detail View Dialog */}
      <DetailView
        vulnerability={selectedVulnerability}
        open={!!selectedVulnerability}
        onClose={handleCloseDetail}
      />

      {/* Filtering Indicator */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={isFiltering}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">
            Filtering {data.length.toLocaleString()} records...
          </Typography>
          <Typography variant="body2" color="inherit">
            Please wait
          </Typography>
        </Box>
      </Backdrop>

      {/* Dashboard Settings Dialog */}
      <DashboardSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
};

export default MainDashboard;
