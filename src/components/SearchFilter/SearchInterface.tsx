import React, { useState, useMemo, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Paper,
  Typography,
  Button,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Lightbulb as LightbulbIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { useVulnerabilityContext } from '../../context/VulnerabilityContext';

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const SEARCH_TIPS = [
  'Search by package name (e.g., "spring-boot", "jackson")',
  'Search by CVE ID (e.g., "CVE-2024-", "CVE-2023-")',
  'Combine with severity filters for precise results',
  'Use partial names to find related packages',
];

const POPULAR_SEARCHES = [
  'spring',
  'jackson',
  'log4j',
  'apache',
  'netty',
  'tomcat',
];


/**
 * Search and filter interface component with debounced search
 */
const SearchInterface: React.FC = () => {
  const {
    data,
    applyFilter,
    filters,
    resetFilters,
  } = useVulnerabilityContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(true);

  // Build search index from package names and CVEs
  const searchIndex = useMemo(() => {
    if (!data) return [];
    const packages = data.map((item) => item.package).filter((pkg): pkg is string => Boolean(pkg));
    const cves = data.map((item) => item.cve).filter((cve): cve is string => Boolean(cve));
    const combined = [...packages, ...cves];
    return Array.from(new Set(combined)).slice(0, 1000);
  }, [data]);

  // Debounced filter application - prevents UI freeze during rapid changes
  const debouncedApplyFilter = useMemo(
    () =>
      debounce((filterType: keyof import('../../types/vulnerability.types').FilterState, value: any) => {
        applyFilter(filterType, value);
      }, 300),
    [applyFilter]
  );

  // Debounced search suggestions
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (term.length < 2) {
          setSuggestions([]);
          return;
        }

        const lowerTerm = term.toLowerCase();
        const results = searchIndex
          .filter((pkg) => pkg.toLowerCase().includes(lowerTerm))
          .slice(0, 20);

        setSuggestions(results);
      }, 300),
    [searchIndex]
  );

  // Handle search input change - debounced for performance
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedApplyFilter('searchTerm', value);
      debouncedSearch(value);
    },
    [debouncedApplyFilter, debouncedSearch]
  );

  // Handle severity filter change - debounced to prevent freeze with large datasets
  const handleSeverityChange = useCallback((event: any) => {
    const value = event.target.value;
    const severities = typeof value === 'string' ? value.split(',') : value;
    debouncedApplyFilter('selectedSeverities', severities);
  }, [debouncedApplyFilter]);

  // Handle reset
  const handleReset = () => {
    setSearchTerm('');
    setSuggestions([]);
    resetFilters();
  };

  const hasActiveFilters =
    filters.searchTerm || filters.selectedSeverities.length > 0;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FilterListIcon color="primary" />
        <Typography variant="h6">Search & Filter</Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Search with autocomplete */}
        <Autocomplete
          freeSolo
          options={suggestions}
          inputValue={searchTerm}
          onInputChange={(event, value) => {
            if (event) {
              handleSearchChange(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search vulnerabilities"
              placeholder="Search by package name, CVE, description..."
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Typography variant="body2">{option}</Typography>
            </li>
          )}
        />

        {/* Severity filter */}
        <FormControl fullWidth>
          <InputLabel id="severity-filter-label">Filter by Severity</InputLabel>
          <Select
            labelId="severity-filter-label"
            multiple
            value={filters.selectedSeverities}
            onChange={handleSeverityChange}
            input={<OutlinedInput label="Filter by Severity" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {SEVERITIES.map((severity) => (
              <MenuItem key={severity} value={severity}>
                {severity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            fullWidth
          >
            Reset All Filters
          </Button>
        )}
      </Box>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <Box mt={2} p={2} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active Filters:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
                onDelete={() => handleSearchChange('')}
              />
            )}
            {filters.selectedSeverities.map((severity) => (
              <Chip
                key={severity}
                label={`Severity: ${severity}`}
                size="small"
                onDelete={() =>
                  debouncedApplyFilter(
                    'selectedSeverities',
                    filters.selectedSeverities.filter((s) => s !== severity)
                  )
                }
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Search hints and tips */}
      <Collapse in={showHints && !searchTerm}>
        <Alert
          severity="info"
          icon={<LightbulbIcon />}
          sx={{ mt: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowHints(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Search Tips
          </Typography>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
            {SEARCH_TIPS.map((tip, index) => (
              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {tip}
              </Typography>
            ))}
          </Box>

          {/* Popular searches */}
          <Box mt={2}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Popular Searches:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {POPULAR_SEARCHES.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSearchChange(term)}
                  clickable
                />
              ))}
            </Box>
          </Box>
        </Alert>
      </Collapse>
    </Paper>
  );
};

export default React.memo(SearchInterface);
