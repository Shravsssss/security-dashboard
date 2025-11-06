/**
 * Severity Utility Functions
 * Provides color mapping for severity levels across the application
 */

/**
 * Get Material-UI color name for a given severity level
 * Used with MUI Chip and other components that accept color prop
 *
 * @param severity - Severity level (case-insensitive)
 * @returns MUI color name ('error', 'warning', 'info', 'success', or 'default')
 */
export const getSeverityColorName = (severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * Get hex color code for a given severity level
 * Used for custom styling, charts, and visualizations
 *
 * @param severity - Severity level (case-insensitive)
 * @returns Hex color code
 */
export const getSeverityColorHex = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '#d32f2f'; // Red
    case 'high':
      return '#f57c00'; // Orange
    case 'medium':
      return '#0288d1'; // Blue
    case 'low':
      return '#388e3c'; // Green
    default:
      return '#757575'; // Grey
  }
};
