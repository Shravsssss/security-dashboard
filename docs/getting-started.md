# Getting Started

This guide will help you set up and run the Security Vulnerability Dashboard on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher - required for React 19)
- **npm** (v8.x or higher) or **yarn** (v1.22.x or higher)
- **Git**
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v8.x or higher
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/[username]/Dashboard.git
cd Dashboard/security-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 19.2.0 and React-DOM
- React Router 7.9.5 for navigation
- Material-UI 7.3.4 components
- React Query 5.90.6 for data fetching and caching
- React Window 2.2.2 for virtualization
- Recharts 3.3.0 for visualizations
- D3.js 7.9.0 for network graphs
- Axios 1.13.1 for HTTP requests
- TypeScript types and utilities

**Installation time:** Approximately 2-3 minutes depending on your internet connection.

### 3. Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm start
```

The application will open automatically at `http://localhost:3000`

**Development Features:**
- Hot module replacement (HMR)
- Real-time error reporting
- Source maps for debugging
- Fast refresh on code changes

### Production Build

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `build/` folder.

**Optimizations Applied:**
- Code minification
- Tree shaking
- Bundle splitting
- Asset optimization

### Serve Production Build

To test the production build locally:

```bash
# Using serve package
npx serve -s build

# Or install serve globally
npm install -g serve
serve -s build
```

## First Time Setup

### 1. Load Sample Data

The dashboard expects vulnerability data in JSON format. Sample data structure:

```json
{
  "vulnerabilities": [
    {
      "id": "unique-id",
      "package": "package-name",
      "severity": "critical",
      "cvss": 9.8,
      "version": "1.2.3",
      "kaiStatus": "valid",
      "riskFactors": ["Has fix", "In use"],
      "cve": "CVE-2024-XXXXX",
      "description": "Vulnerability description",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Configure Data Source

Update `src/utils/dataLoader.ts` to point to your data source:

```typescript
export const loadVulnerabilityData = async (): Promise<VulnerabilityData[]> => {
  // Option 1: Load from local JSON file
  const response = await fetch('/data/vulnerabilities.json');

  // Option 2: Load from API endpoint
  // const response = await fetch('https://api.example.com/vulnerabilities');

  const data = await response.json();
  return data.vulnerabilities;
};
```

### 3. Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
REACT_APP_API_ENDPOINT=https://your-api.com
REACT_APP_ENABLE_ANALYTICS=false
```

## Project Structure

After installation, your project structure should look like:

```
security-dashboard/
├── public/
│   ├── index.html
│   └── data/              # Optional: Sample data
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard/     # Dashboard & settings components
│   │   ├── Visualizations/ # 8 chart components
│   │   ├── VulnerabilityList/ # Table & detail view
│   │   ├── SearchFilter/  # Search & filter components
│   │   └── Comparison/    # Comparison view
│   ├── context/           # React Context providers
│   │   ├── VulnerabilityContext.tsx
│   │   └── DashboardSettingsContext.tsx
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── workers/           # Web workers for performance
│   ├── types/             # TypeScript definitions
│   ├── constants/         # App constants (severity levels, etc.)
│   ├── App.tsx            # Main app with React Router
│   └── index.tsx          # Entry point
├── docs/                  # Documentation (this folder)
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Walkthrough

### Initial Load

1. Open `http://localhost:3000`
2. You'll see the Dashboard tab by default
3. Wait for data to load (progress indicator shown)
4. Metrics cards display aggregate statistics

### Exploring Features

**Dashboard Tab:**
- View overall metrics (Total Vulnerabilities, Critical/High counts)
- Explore visualizations (charts and graphs)
- Click "Analysis" or "AI Analysis" buttons for insights

**Vulnerability List Tab:**
- Browse all vulnerabilities in a virtualized table
- Click any column header to sort
- Use search box to filter results
- Click individual rows for detailed view
- Click "Compare" icon to add to comparison

**Comparison Tab:**
- View side-by-side comparison of selected vulnerabilities
- Compare severities, CVSS scores, and risk factors
- Clear individual items or all at once

## Common Issues

### Port Already in Use

If port 3000 is busy:

```bash
# Set custom port
PORT=3001 npm start

# Or on Windows
set PORT=3001 && npm start
```

### Module Not Found

Clear cache and reinstall:

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Build Failures

Check Node.js version:

```bash
node --version  # Must be v18+ for React 19
```

Update if needed:
```bash
nvm install 18
nvm use 18
```

## Next Steps

- [Learn the Architecture](architecture.md) - Understand how the app works
- [Explore Components](components/dashboard.md) - Deep dive into components
- [Performance Guide](performance.md) - Optimization techniques

## Getting Help

- [Troubleshooting Guide](troubleshooting.md)
- [GitHub Issues](https://github.com/[username]/Dashboard/issues)

---

[← Back to Home](index.md) | [Architecture →](architecture.md)
