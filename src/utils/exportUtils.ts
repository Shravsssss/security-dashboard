import { VulnerabilityData } from '../types/vulnerability.types';

/**
 * Converts vulnerability data to CSV format
 */
export const convertToCSV = (data: VulnerabilityData[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert each row
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header as keyof VulnerabilityData];

        // Handle arrays (like riskFactors)
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }

        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Downloads a file to the user's computer
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports filtered vulnerability data in CSV or JSON format
 */
export const exportFilteredData = (
  data: VulnerabilityData[],
  format: 'csv' | 'json',
  filename?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `vulnerabilities_${timestamp}`;

  if (format === 'csv') {
    const csv = convertToCSV(data);
    downloadFile(csv, filename || `${defaultFilename}.csv`, 'text/csv');
  } else {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename || `${defaultFilename}.json`, 'application/json');
  }
};

/**
 * Exports metrics summary as JSON
 */
export const exportMetrics = (metrics: any, filename?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const json = JSON.stringify(metrics, null, 2);
  downloadFile(
    json,
    filename || `vulnerability_metrics_${timestamp}.json`,
    'application/json'
  );
};
