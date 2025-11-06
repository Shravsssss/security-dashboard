/**
 * Severity Constants
 * Centralized severity-related constants used across the application
 */

/**
 * Array of severity levels in order from highest to lowest
 */
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const;

/**
 * Severity ordering for sorting purposes
 * Higher numbers indicate higher severity
 */
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Severity weights for risk scoring calculations
 * Used to calculate overall risk scores based on severity levels
 */
export const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 10,
  high: 5,
  medium: 2,
  low: 1,
};

/**
 * Type definition for severity levels
 */
export type SeverityLevel = typeof SEVERITIES[number];
