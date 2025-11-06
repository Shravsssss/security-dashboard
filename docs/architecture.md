# Architecture

This document explains the high-level architecture, design patterns, and technical decisions behind the Security Vulnerability Dashboard.

## Overview

The application follows a modern React architecture with emphasis on performance, maintainability, and scalability. It's designed to handle large datasets (200K+ records) while maintaining smooth user experience.

## Technology Stack

### Core Technologies

**React 19.2.0**
- Latest React with automatic batching improvements
- Concurrent features for better performance
- Enhanced hooks API

**React Router 7.9.5**
- Client-side routing and navigation
- Tab-based navigation system
- Clean URL structure

**TypeScript 4.9+**
- Full type safety across the codebase
- Strict mode enabled
- Interface-driven development

**Material-UI 7.3.4**
- Consistent design system
- Accessible components
- Themeable and customizable

### State Management

**React Query (@tanstack/react-query)**
- Server state management
- Automatic caching and invalidation
- Background refetching
- Optimistic updates

**React Context API**
- Application state (filters, search)
- Theme and UI preferences
- Shared data access

### Performance Libraries

**React Window**
- Virtual scrolling for large lists
- Renders only visible items
- Smooth 60fps scrolling

**Lodash**
- Debounce for search/filter operations
- Utility functions
- Performance helpers

### Visualization

**Recharts 3.3.0**
- Declarative chart components
- Responsive and interactive
- Bar charts, pie charts, line charts, heatmaps

**D3.js 7.9.0**
- Interactive network graph visualization
- Force-directed layouts
- Custom data visualizations
- Advanced SVG manipulation

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Dashboard  │  │  Vuln List │  │ Comparison │           │
│  │    Tab     │  │    Tab     │  │    Tab     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌──────────────┐ ┌──────────────┐  ┌──────────────┐      │
│  │MetricsView   │ │VirtualizedTbl │  │Visualizations│      │
│  ├──────────────┤ ├──────────────┤  ├──────────────┤      │
│  │SearchFilter  │ │DetailView    │  │ComparisonView│      │
│  └──────────────┘ └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  VulnerabilityContext (React Context)               │   │
│  │  - filters, search, tab state                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DashboardSettingsContext (React Context)           │   │
│  │  - chart visibility, theme mode, dashboard config   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Query (Server State)                         │   │
│  │  - data fetching, caching, background updates       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Utility Layer                             │
│  ┌──────────────┐ ┌──────────────┐  ┌──────────────┐      │
│  │dataProcessing│ │ dataLoader   │  │ exportUtils  │      │
│  ├──────────────┤ ├──────────────┤  ├──────────────┤      │
│  │severityUtils │ │ cvssUtils    │  │ filterUtils  │      │
│  └──────────────┘ └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Source                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  JSON File / API Endpoint                           │   │
│  │  - Vulnerability data (236K+ records)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (React Router)
├── VulnerabilityProvider (Context)
│   └── DashboardSettingsProvider (Context)
│       └── MainDashboard
│           ├── AppBar
│           ├── DashboardSettingsDialog
│           ├── Tabs
│           │   ├── Dashboard Tab
│           │   │   ├── MetricsView
│           │   │   ├── ActionButtons
│           │   │   ├── RiskScoringDashboard
│           │   │   ├── SeverityDistribution
│           │   │   ├── RiskFactorsFrequency
│           │   │   ├── TrendAnalysis
│           │   │   ├── PackageSeverityHeatmap
│           │   │   ├── DependencyNetworkGraph (D3.js)
│           │   │   ├── AIManualComparisonChart
│           │   │   └── TopCriticalVulnerabilities
│           │   ├── Vulnerability List Tab
│           │   │   ├── SearchInterface
│           │   │   ├── FilterPanel
│           │   │   └── VirtualizedTable
│           │   │       └── Row (virtualized)
│           │   └── Comparison Tab
│           │       └── ComparisonView
│           └── DetailView (Dialog)
```

## Design Patterns

### 1. Provider Pattern

Used for shared state across the app:

```typescript
<VulnerabilityProvider>
  <App />
</VulnerabilityProvider>
```

**Benefits:**
- Avoids prop drilling
- Single source of truth
- Easy to test

### 2. Compound Components

Components that work together (e.g., Table, Row):

```typescript
<VirtualizedTable data={data}>
  <Row /> {/* Managed internally by react-window */}
</VirtualizedTable>
```

### 3. Custom Hooks

Reusable logic encapsulation:

```typescript
const { data, filters, applyFilter } = useVulnerabilityContext();
```

### 4. Memoization

Performance optimization:

```typescript
// Component memoization
export default React.memo(Component);

// Value memoization
const sortedData = useMemo(() => sort(data), [data]);

// Callback memoization
const handleClick = useCallback(() => {}, []);
```

### 5. Render Props

Flexible component composition:

```typescript
<List
  rowComponent={Row}
  rowProps={data}
/>
```

## Data Flow

### Loading Flow

1. **Initial Load:**
   ```
   App Mount
     → VulnerabilityProvider initializes
     → React Query fetchVulnerabilityData
     → dataLoader.ts fetches from source
     → processVulnerabilityData calculates metrics
     → Cache results in React Query
     → Render UI with data
   ```

2. **Tab Navigation:**
   ```
   User clicks tab
     → Update selectedTab state
     → TabPanel shows/hides
     → Conditional rendering
     → No data refetch (cached)
   ```

3. **Filtering:**
   ```
   User types in search
     → Debounced input (300ms)
     → Update filters state
     → filterVulnerabilities runs
     → useMemo recalculates
     → VirtualizedTable updates
   ```

4. **Sorting:**
   ```
   User clicks column header
     → handleSort updates sortField
     → useEffect detects change
     → Guard prevents concurrent sorts
     → sortVulnerabilities executes
     → Loading indicator shows
     → Table updates with sorted data
   ```

### State Updates

```typescript
// Filter state update
setFilters(prev => ({
  ...prev,
  searchTerm: newValue
}));

// Optimized with useMemo
const filteredData = useMemo(() =>
  filterVulnerabilities(data, filters),
  [data, filters]
);
```

## Performance Strategy

### 1. Virtualization

Only render visible rows:
- 236K records, but only ~20 rendered at any time
- Constant memory usage regardless of dataset size
- 60fps scrolling

### 2. Memoization

Strategic caching:
```typescript
// Component level
export default React.memo(MetricsView);

// Value level
const metrics = useMemo(() => calculateMetrics(data), [data]);

// Callback level
const handleFilter = useCallback((term) => filter(term), []);
```

### 3. Debouncing

Delay expensive operations:
```typescript
const debouncedSearch = debounce(search, 300);
```

### 4. Code Splitting

Lazy load heavy components:
```typescript
const HeavyChart = lazy(() => import('./HeavyChart'));
```

### 5. Optimistic Sorting

Show loading state immediately:
```typescript
setIsSorting(true);
setTimeout(() => {
  const sorted = sort(data);
  setSortedData(sorted);
  setIsSorting(false);
}, 0);
```

## File Structure

```
src/
├── components/          # UI Components
│   ├── Dashboard/      # Dashboard tab & settings dialog
│   │   ├── MainDashboard.tsx
│   │   ├── MetricsView.tsx
│   │   ├── ActionButtons.tsx
│   │   └── DashboardSettingsDialog.tsx
│   ├── Visualizations/ # 8 chart components
│   │   ├── RiskScoringDashboard.tsx
│   │   ├── SeverityDistribution.tsx
│   │   ├── RiskFactorsFrequency.tsx
│   │   ├── TrendAnalysis.tsx
│   │   ├── PackageSeverityHeatmap.tsx
│   │   ├── DependencyNetworkGraph.tsx (D3.js)
│   │   ├── AIManualComparisonChart.tsx
│   │   └── TopCriticalVulnerabilities.tsx
│   ├── VulnerabilityList/ # List and detail views
│   │   ├── VirtualizedTable.tsx
│   │   └── DetailView.tsx
│   ├── SearchFilter/   # Search and filtering
│   │   ├── SearchInterface.tsx
│   │   └── FilterPanel.tsx
│   └── Comparison/     # Comparison view
│       └── ComparisonView.tsx
├── context/            # React Context providers
│   ├── VulnerabilityContext.tsx
│   └── DashboardSettingsContext.tsx
├── hooks/              # Custom hooks
│   └── useSortWorker.ts
├── workers/            # Web workers for performance
│   └── sortWorker.ts
├── types/              # TypeScript definitions
│   └── vulnerability.types.ts
├── utils/              # Utility functions
│   ├── dataProcessing.ts  # Sort, filter logic
│   ├── dataLoader.ts      # Data fetching with Axios
│   ├── exportUtils.ts     # CSV/JSON export
│   ├── severityUtils.ts   # Severity helpers
│   └── cvssUtils.ts       # CVSS scoring
├── constants/          # App constants
│   └── severity.ts
├── App.tsx             # Main app with React Router
└── index.tsx           # Entry point
```

## Routing Architecture

The application uses **React Router 7.9.5** with **BrowserRouter** for clean URLs:

```typescript
// App.tsx
<BrowserRouter>
  <VulnerabilityProvider>
    <DashboardSettingsProvider>
      <MainDashboard />
    </DashboardSettingsProvider>
  </VulnerabilityProvider>
</BrowserRouter>
```

### Route Structure

**Single Page Application (SPA):**
- All routes redirect to `/`
- Tab-based navigation within the app
- No deep linking to specific tabs

**Benefits:**
- Fast navigation (no page reloads)
- Preserved state when switching tabs
- Clean URL structure
- Works seamlessly with Vercel deployment via `vercel.json` rewrites

## Type System

### Core Types

```typescript
interface VulnerabilityData {
  id: string;
  package: string;
  severity: string;
  cvss?: number;
  version?: string;
  kaiStatus: string;
  riskFactors?: string[];
  cve?: string;
  description?: string;
  timestamp?: string;
}

interface VulnerabilityMetrics {
  totalCount: number;
  severityCounts: Record<string, number>;
  avgCvss: number;
  riskFactorFrequency: Record<string, number>;
  kaiStatusCounts: Record<string, number>;
}

interface FilterState {
  excludeNoRisk: boolean;
  excludeAiNoRisk: boolean;
  searchTerm: string;
  selectedSeverities: string[];
  selectedRiskFactors: string[];
}
```

## Build Configuration

### Development

- Hot Module Replacement (HMR)
- Source maps
- Fast refresh
- Error overlays

### Production

- Minification (Terser)
- Tree shaking
- Code splitting
- Asset optimization
- Gzip compression

---

[← Getting Started](getting-started.md) | [Components →](components/dashboard.md) | [Performance →](performance.md)
