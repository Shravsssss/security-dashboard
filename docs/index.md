# Security Vulnerability Dashboard

A high-performance, React-based dashboard for visualizing and analyzing security vulnerabilities at scale. Built to handle datasets with 200,000+ vulnerabilities with smooth performance and rich interactive features.

## Overview

This dashboard provides comprehensive tools for security teams to analyze, visualize, and manage vulnerability data efficiently. It combines powerful data processing with an intuitive interface to help prioritize remediation efforts.

![Dashboard Screenshot](assets/dashboard-screenshot.png)

## Key Features

### 📊 Advanced Visualizations (8 Interactive Charts)
- **Risk Scoring Dashboard** - Composite risk assessment with prioritization
- **Severity Distribution** - Interactive pie charts showing vulnerability breakdown
- **Risk Factors Frequency** - Bar chart of top risk factors
- **Trend Analysis** - Time-series vulnerability patterns
- **Package × Severity Heatmap** - Heat map of packages vs severity levels
- **Dependency Network Graph** - D3.js interactive network visualization
- **AI vs Manual Comparison** - Comparison of AI and manual detection methods
- **Top Critical Vulnerabilities** - Table of most critical issues requiring attention

### ⚡ Performance Optimized
- **Virtual Scrolling** - Handles 236,000+ records smoothly
- **React Query Caching** - Smart data fetching and caching
- **Optimized Filtering** - Sub-second search across massive datasets
- **Memoization** - Strategic use of React.memo and useMemo
- **Debounced Operations** - Smooth user experience

### 🔍 Powerful Search & Filtering
- **Multi-Criteria Search** - Search across package names, CVEs, descriptions
- **Dynamic Filters** - Filter by severity, risk factors, KAI status
- **Real-time Updates** - Instant feedback as you filter
- **Export Options** - Export filtered data as CSV or JSON

### 📈 Side-by-Side Comparison
- **Vulnerability Comparison** - Compare multiple vulnerabilities
- **Metric Analysis** - Side-by-side risk assessment
- **Visual Diff** - Highlight differences between items

### 🎯 Manual Sorting
- **Click-to-Sort** - Sort by any column (Package, Severity, CVSS, Version, etc.)
- **Direction Toggle** - Ascending/descending support
- **Fast Performance** - 200-500ms sort time for 236K records
- **Loading Indicators** - Visual feedback during operations

## Technology Stack

- **React 19.2.0** - Latest React with improved performance
- **React Router 7.9.5** - Client-side routing and navigation
- **TypeScript 4.9.5** - Type-safe code for better maintainability
- **Material-UI 7.3.4** - Professional component library
- **React Query 5.90.6** - Data fetching and caching
- **React Window 2.2.2** - Virtual scrolling for large lists
- **Recharts 3.3.0** - Beautiful, responsive charts
- **D3.js 7.9.0** - Interactive network graph visualizations
- **Axios 1.13.1** - HTTP client for data fetching

## Quick Start

```bash
# Clone the repository
git clone https://github.com/[username]/Dashboard.git

# Navigate to project
cd Dashboard/security-dashboard

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Documentation

### Getting Started
- [Installation Guide](getting-started.md) - Install and run the app locally
- [Architecture Overview](architecture.md) - System design and patterns

### Components & Features
- [Dashboard Components](components/dashboard.md) - Main dashboard and settings
- [Virtualized Table](components/virtualized-table.md) - High-performance data table

### Technical Guides
- [Performance Optimizations](performance.md) - Optimization strategies and metrics
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Performance Metrics

| Metric | Value |
|--------|-------|
| Initial Load Time | < 3s for 236K records |
| Virtualization | Renders only ~20 visible rows |
| Filter Response | < 500ms |
| Sort Time | 200-500ms |
| Memory Usage | ~150-200MB |
| Bundle Size | 142KB gzipped |

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or help:
- [GitHub Issues](https://github.com/[username]/Dashboard/issues) - Report bugs or request features
- [Troubleshooting Guide](troubleshooting.md) - Common issues and solutions

---

**Next Steps:**
1. [Get Started →](getting-started.md) - Install and run locally
2. [Learn the Architecture →](architecture.md) - Understand the system design
3. [Explore Performance →](performance.md) - Optimization techniques
