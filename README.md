# Security Vulnerability Dashboard

A high-performance React TypeScript application for visualizing and analyzing security vulnerabilities from large datasets (300MB+, up to 1M rows).

Application deployed at https://security-dashboard-alpha.vercel.app/

## 📖 Documentation

**[View Full Documentation →](docs/index.md)**

- [Getting Started Guide](docs/getting-started.md) - Installation and setup
- [Architecture Overview](docs/architecture.md) - System design and patterns
- [Component Docs](docs/components/dashboard.md) - Detailed component reference
- [Performance Guide](docs/performance.md) - Optimization techniques
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Features

### Core Functionality
- **Dashboard View**: Overview with metrics, visualizations, and KAI status breakdown
  - Customizable dashboard settings (toggle charts, change themes)
  - Real-time metrics display
  - Analysis and AI Analysis filtering buttons
- **Virtualized List**: Efficiently displays large datasets (1M+ rows) using react-window
- **Advanced Filtering**:
  - Analysis button - Excludes "invalid - norisk" vulnerabilities
  - AI Analysis button - Excludes "ai-invalid-norisk" vulnerabilities
  - Search by package name, CVE, description
  - Filter by severity levels (Critical, High, Medium, Low)
- **8 Interactive Visualizations**:
  - Risk Scoring Dashboard - Comprehensive risk metrics
  - Severity Distribution - Pie chart showing vulnerability breakdown
  - Risk Factors Frequency - Bar chart of top risk factors
  - Trend Analysis - Time-series vulnerability trends
  - Package × Severity Heatmap - Heat map of packages vs severity
  - Dependency Network Graph - D3.js interactive network visualization
  - AI vs Manual Comparison - Comparison of AI and manual detection
  - Top Critical Vulnerabilities - Table of most critical issues
- **Comparison View**: Side-by-side comparison of multiple vulnerabilities
- **Export Functionality**: Export filtered data as CSV or JSON

### Performance Optimizations
- **React Query**: Intelligent data caching and state management
- **Virtual Scrolling**: Only renders visible rows for optimal performance
- **Lazy Loading**: Code splitting for faster initial load
- **Debounced Search**: Prevents excessive re-renders during typing
- **Memoization**: Optimized re-rendering with useMemo and memo

## Tech Stack

- **React 19.2.0** with TypeScript 4.9.5
- **React Router 7.9.5** for navigation
- **React Query 5.90.6** (@tanstack/react-query) for state management and caching
- **Material-UI 7.3.4** (@mui/material) for UI components
- **Recharts 3.3.0** for charts and data visualization
- **D3.js 7.9.0** for interactive network graphs
- **react-window 2.2.2** for virtual scrolling
- **Axios 1.13.1** for HTTP requests
- **Lodash 4.17.21** for utility functions

## Getting Started

### Prerequisites
- Node.js 18+ and npm (required for React 19)

### Installation

Dependencies are already installed. If needed:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard/              # Dashboard components & settings
│   ├── Visualizations/         # 8 interactive charts and graphs
│   ├── VulnerabilityList/      # Virtualized table & detail view
│   ├── SearchFilter/           # Search and filter UI
│   └── Comparison/             # Comparison feature
├── context/                    # React context providers
│   ├── VulnerabilityContext.tsx
│   └── DashboardSettingsContext.tsx
├── utils/                      # Utility functions (CVSS, export, etc.)
├── hooks/                      # Custom React hooks
├── workers/                    # Web workers for performance
├── constants/                  # App constants (severity levels, etc.)
├── types/                      # TypeScript definitions
└── App.tsx                     # Main app with routing
```

## Usage Guide

### Dashboard Tab
- View overall metrics and statistics
- Click **Analysis** button to exclude "invalid - norisk" vulnerabilities
- Click **AI Analysis** button to exclude "ai-invalid-norisk" vulnerabilities
- View visual charts for severity distribution and risk factors

### Vulnerability List Tab
- Search for specific vulnerabilities
- Filter by severity
- Click any row for details
- Export as CSV or JSON

### Compare Tab
- Add vulnerabilities for side-by-side comparison
- View detailed comparisons
- Remove items or clear all

## Data Source

Loads from: `https://raw.githubusercontent.com/chanduusc/Ui-Demo-Data/main/ui_demo.json`

## Performance Notes

- Initial load: 10-30 seconds for large datasets
- Data cached after first load
- Virtual scrolling for optimal rendering
- Debounced search with 300ms delay

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)
