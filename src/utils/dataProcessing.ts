import { VulnerabilityData, VulnerabilityMetrics } from '../types/vulnerability.types';
import { SEVERITY_ORDER } from '../constants/severity';

/**
 * Groups vulnerabilities by severity level and counts them
 *
 * @param data - Array of vulnerability data to group
 * @returns Object with counts for each severity level (critical, high, medium, low)
 *
 * @remarks
 * - Case-insensitive severity matching
 * - Unknown severities are ignored (not counted)
 * - Optimized using reduce() for single-pass counting
 * - Time complexity: O(n) where n is the number of vulnerabilities
 *
 * @example
 * ```typescript
 * const grouped = groupBySeverity(vulnerabilities);
 * // Returns: { critical: 15, high: 42, medium: 128, low: 305 }
 * ```
 */
export const groupBySeverity = (data: VulnerabilityData[]) => {
  return data.reduce(
    (acc, item) => {
      const severity = item.severity.toLowerCase();
      if (severity in acc) {
        acc[severity as keyof typeof acc]++;
      }
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
};

/**
 * Calculates frequency of risk factors across all vulnerabilities
 * Handles both array format and object format (for backward compatibility)
 */
export const calculateRiskFrequency = (data: VulnerabilityData[]): Record<string, number> => {
  const frequencyMap: Record<string, number> = {};

  data.forEach((item) => {
    if (item.riskFactors) {
      if (Array.isArray(item.riskFactors)) {
        // Array format (preferred)
        item.riskFactors.forEach((factor) => {
          frequencyMap[factor] = (frequencyMap[factor] || 0) + 1;
        });
      } else if (typeof item.riskFactors === 'object') {
        // Object format (fallback for legacy data)
        Object.keys(item.riskFactors).forEach((factor) => {
          frequencyMap[factor] = (frequencyMap[factor] || 0) + 1;
        });
      }
    }
  });

  return frequencyMap;
};

/**
 * Processes vulnerability data to calculate pre-computed metrics for dashboard performance
 *
 * @param data - Array of vulnerability data to process
 * @returns Computed metrics object containing aggregated statistics
 *
 * @remarks
 * This function pre-calculates expensive aggregations to avoid recomputing them on every render.
 * Metrics are calculated once and cached in context for optimal performance.
 *
 * Computed metrics include:
 * - Total vulnerability count
 * - Severity distribution (critical, high, medium, low counts)
 * - Risk factors frequency map (counts for each risk factor across all vulnerabilities)
 * - KAI status breakdown (invalid-norisk, ai-invalid-norisk, other)
 *
 * Performance: O(n) where n is the number of vulnerabilities
 * This is acceptable as it runs only once during initial data load
 *
 * @example
 * ```typescript
 * const metrics = processVulnerabilityData(allVulnerabilities);
 * console.log(metrics.total); // 236542
 * console.log(metrics.severityDistribution); // { critical: 150, high: 1203, ... }
 * ```
 */
export const processVulnerabilityData = (data: VulnerabilityData[]): VulnerabilityMetrics => {
  const metrics: VulnerabilityMetrics = {
    total: data.length,
    severityDistribution: groupBySeverity(data),
    riskFactorsFrequency: calculateRiskFrequency(data),
    kaiStatusBreakdown: {
      'invalid-norisk': data.filter((d) => d.kaiStatus === 'invalid - norisk').length,
      'ai-invalid-norisk': data.filter((d) => d.kaiStatus === 'ai-invalid-norisk').length,
      other: data.filter(
        (d) => !['invalid - norisk', 'ai-invalid-norisk'].includes(d.kaiStatus)
      ).length,
    },
  };

  return metrics;
};

/**
 * Filters vulnerabilities by KAI status - efficient filtering for action buttons
 */
export const filterByKaiStatus = (
  data: VulnerabilityData[],
  excludeStatus: ('invalid - norisk' | 'ai-invalid-norisk')[]
): VulnerabilityData[] => {
  return data.filter((item) => !excludeStatus.includes(item.kaiStatus as any));
};

/**
 * Searches vulnerabilities by package name or other fields
 */
export const searchVulnerabilities = (
  data: VulnerabilityData[],
  searchTerm: string
): VulnerabilityData[] => {
  if (!searchTerm) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(
    (item) =>
      item.package?.toLowerCase().includes(term) ||
      item.severity?.toLowerCase().includes(term) ||
      item.kaiStatus?.toLowerCase().includes(term) ||
      item.cve?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
  );
};

/**
 * Filters vulnerabilities by multiple criteria
 * Optimized using Sets for O(1) lookup - handles 1M+ vulnerabilities efficiently
 */
export const filterVulnerabilities = (
  data: VulnerabilityData[],
  filters: {
    searchTerm?: string;
    severities?: string[];
    riskFactors?: string[];
    excludeKaiStatus?: string[];
  }
): VulnerabilityData[] => {
  // Start with original data - filter methods create new arrays anyway
  let filtered = data;

  // Apply search filter
  if (filters.searchTerm) {
    filtered = searchVulnerabilities(filtered, filters.searchTerm);
  }

  // Apply severity filter (case-insensitive)
  // Use Set for O(1) lookup instead of array.includes() which is O(n)
  if (filters.severities && filters.severities.length > 0) {
    const severitySet = new Set(filters.severities.map(s => s.toLowerCase()));
    filtered = filtered.filter((item) =>
      severitySet.has(item.severity?.toLowerCase() || '')
    );
  }

  // Apply risk factors filter
  // Use Set for O(1) lookup - critical for large datasets with many risk factors
  if (filters.riskFactors && filters.riskFactors.length > 0) {
    const riskFactorSet = new Set(filters.riskFactors);
    filtered = filtered.filter((item) => {
      // Only include items that have risk factors and at least one matches
      if (!item.riskFactors || !Array.isArray(item.riskFactors) || item.riskFactors.length === 0) {
        return false;
      }
      // Check if any risk factor is in the Set (O(m) where m is risk factors per item)
      return item.riskFactors.some((factor) => riskFactorSet.has(factor));
    });
  }

  // Apply KAI status exclusion filter
  // Use Set for O(1) lookup
  if (filters.excludeKaiStatus && filters.excludeKaiStatus.length > 0) {
    const excludeSet = new Set(filters.excludeKaiStatus);
    filtered = filtered.filter(
      (item) => !excludeSet.has(item.kaiStatus)
    );
  }

  return filtered;
};

/**
 * Sorts vulnerabilities by a specified field with optimized performance for large datasets
 *
 * @param data - Array of vulnerabilities to sort (creates a shallow copy, does not mutate original)
 * @param field - Field name to sort by, or 'riskFactorsCount' for sorting by risk factor count
 * @param direction - Sort direction: 'asc' for ascending (default), 'desc' for descending
 * @returns New sorted array of vulnerabilities
 *
 * @remarks
 * Performance optimizations:
 * - Uses shallow copy ([...data]) to avoid mutating original array
 * - Custom severity ordering using SEVERITY_ORDER lookup (Critical > High > Medium > Low)
 * - Fast string comparison without localeCompare for better performance with 100K+ records
 * - Special handling for null/undefined values (always sorted to end)
 * - Risk factors count calculated on-the-fly
 *
 * @example
 * ```typescript
 * // Sort by severity (high to low)
 * const sorted = sortVulnerabilities(data, 'severity', 'desc');
 *
 * // Sort by CVSS score (low to high)
 * const sortedByCVSS = sortVulnerabilities(data, 'cvss', 'asc');
 *
 * // Sort by risk factor count
 * const sortedByRisk = sortVulnerabilities(data, 'riskFactorsCount', 'desc');
 * ```
 */
export const sortVulnerabilities = (
  data: VulnerabilityData[],
  field: keyof VulnerabilityData | 'riskFactorsCount',
  direction: 'asc' | 'desc' = 'asc'
): VulnerabilityData[] => {
  return [...data].sort((a, b) => {
    // Special handling for risk factors count
    if (field === 'riskFactorsCount') {
      const aCount = a.riskFactors?.length || 0;
      const bCount = b.riskFactors?.length || 0;
      return direction === 'asc' ? aCount - bCount : bCount - aCount;
    }

    // Special handling for severity with custom order
    if (field === 'severity') {
      const aSeverity = SEVERITY_ORDER[a.severity?.toLowerCase() || ''] || 0;
      const bSeverity = SEVERITY_ORDER[b.severity?.toLowerCase() || ''] || 0;
      return direction === 'asc' ? aSeverity - bSeverity : bSeverity - aSeverity;
    }

    const aVal = a[field as keyof VulnerabilityData];
    const bVal = b[field as keyof VulnerabilityData];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    // Fast string comparison - much faster than localeCompare for large datasets
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const aStr = aVal.toLowerCase();
      const bStr = bVal.toLowerCase();
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
};
