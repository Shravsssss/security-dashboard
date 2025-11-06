/**
 * Sort Worker - Handles heavy sorting operations in background thread
 * This prevents UI blocking when sorting large datasets (236K+ records)
 */

/* eslint-disable no-restricted-globals */

// Define types inline to avoid import issues in worker context
interface VulnerabilityData {
  id: string;
  package: string;
  severity: string;
  cvss?: number;
  cve?: string;
  description?: string;
  version?: string;
  kaiStatus: string;
  riskFactors?: string[];
  [key: string]: any;
}

// Severity ordering for sorting (inline to avoid imports)
const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Sort vulnerabilities by a specified field
 * Optimized for performance with large datasets
 */
function sortVulnerabilities(
  data: VulnerabilityData[],
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): VulnerabilityData[] {
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

    const aVal = a[field];
    const bVal = b[field];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    // Fast string comparison
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
}

// Message handler for worker
self.onmessage = (e: MessageEvent) => {
  const { type, data, field, direction, requestId } = e.data;

  if (type === 'SORT') {
    try {
      // Perform sorting
      const sorted = sortVulnerabilities(data, field, direction);

      // Send result back to main thread
      self.postMessage({
        type: 'SORT_COMPLETE',
        data: sorted,
        requestId,
      });
    } catch (error) {
      // Send error back to main thread
      self.postMessage({
        type: 'SORT_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      });
    }
  }
};

// Export empty object to make TypeScript happy
export {};
