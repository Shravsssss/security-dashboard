/**
 * CVSS Utility Functions
 * Provides CVSS score-related utilities and color mapping
 */

/**
 * Get color code for a CVSS score
 * Based on CVSS v3.0 severity ratings
 *
 * @param cvss - CVSS score (0-10), or undefined
 * @returns Hex color code
 */
export const getCvssColor = (cvss: number | undefined): string => {
  if (cvss === undefined || cvss === null) return '#666'; // Grey for missing scores
  if (cvss >= 9.0) return '#d32f2f'; // Critical (9.0-10.0) - Red
  if (cvss >= 7.0) return '#f57c00'; // High (7.0-8.9) - Orange
  if (cvss >= 4.0) return '#fbc02d'; // Medium (4.0-6.9) - Yellow
  return '#388e3c'; // Low (0.1-3.9) - Green
};

/**
 * Get severity level text for a CVSS score
 * Based on CVSS v3.0 severity ratings
 *
 * @param cvss - CVSS score (0-10), or undefined
 * @returns Severity level text
 */
export const getCvssSeverityLevel = (cvss: number | undefined): string => {
  if (cvss === undefined || cvss === null) return 'Unknown';
  if (cvss >= 9.0) return 'Critical';
  if (cvss >= 7.0) return 'High';
  if (cvss >= 4.0) return 'Medium';
  if (cvss > 0) return 'Low';
  return 'None';
};

/**
 * Format CVSS score for display
 *
 * @param cvss - CVSS score (0-10), or undefined
 * @returns Formatted string
 */
export const formatCvssScore = (cvss: number | undefined): string => {
  if (cvss === undefined || cvss === null) return 'N/A';
  return cvss.toFixed(1);
};
