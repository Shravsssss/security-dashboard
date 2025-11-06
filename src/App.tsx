import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VulnerabilityProvider } from './context/VulnerabilityContext';
import { DashboardSettingsProvider } from './context/DashboardSettingsContext';

// Lazy load components for code splitting
const MainDashboard = lazy(() => import('./components/Dashboard/MainDashboard'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: Infinity,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
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
      Loading...
    </Typography>
  </Box>
);

function App() {
  return (
    <DashboardSettingsProvider>
      <QueryClientProvider client={queryClient}>
        <VulnerabilityProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<MainDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </VulnerabilityProvider>
      </QueryClientProvider>
    </DashboardSettingsProvider>
  );
}

export default App;
