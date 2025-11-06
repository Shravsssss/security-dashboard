# Dashboard Component

The Dashboard is the default landing page that provides a comprehensive overview of all vulnerability data with metrics, visualizations, and analysis tools.

## Overview

**File:** `src/components/Dashboard/MainDashboard.tsx`

The MainDashboard component orchestrates the entire application, managing tabs, state, and rendering all sub-components.

## Features

### 1. Metrics View
Displays aggregate statistics:
- Total Vulnerabilities
- Critical Count
- High Count
- CVSS Average
- Risk Factor Distribution
- KAI Status Breakdown

### 2. Action Buttons
- **Analysis Button:** Shows severity breakdown and recommendations
- **AI Analysis Button:** AI-generated insights and prioritization

### 3. Visualizations
- Risk Scoring Dashboard
- Severity Distribution Chart
- Risk Factors Frequency
- Trend Analysis
- Package Severity Heatmap
- Dependency Network Graph

## Component Structure

```typescript
<MainDashboard>
  <AppBar>Security Vulnerability Dashboard</AppBar>

  <Tabs>
    <Tab label="Dashboard" />
    <Tab label="Vulnerability List" />
    <Tab label="Compare" />
  </Tabs>

  <TabPanel value={0}>
    <MetricsView metrics={metrics} />
    <ActionButtons />
    <RiskScoringDashboard data={data} />
    {/* Other visualizations */}
  </TabPanel>
</MainDashboard>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| None | - | MainDashboard has no props, uses context |

## Context Usage

```typescript
const {
  data,              // All vulnerability data
  filteredData,      // Filtered data for list view
  metrics,           // Aggregate metrics
  selectedTab,       // Current active tab
  setSelectedTab     // Tab switcher
} = useVulnerabilityContext();
```

## Key Functionality

### Tab Management

```typescript
const handleTabChange = (event, newValue) => {
  setSelectedTab(newValue);
};
```

### Conditional Rendering

```typescript
{selectedTab === 0 && (
  <DashboardContent />
)}
```

---

[← Architecture](../architecture.md) | [Virtualized Table →](virtualized-table.md)
