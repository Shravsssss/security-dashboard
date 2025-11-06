import { VulnerabilityData } from '../types/vulnerability.types';
import axios from 'axios';

// Use GitHub's media URL for Git LFS files
const DATA_URL = 'https://media.githubusercontent.com/media/chanduusc/Ui-Demo-Data/main/ui_demo.json';

/**
 * Loads vulnerability data from the remote JSON file
 * Handles large files (300MB+, potentially 1M rows) using axios
 */
export const loadVulnerabilityData = async (
  onProgress?: (loaded: number) => void
): Promise<VulnerabilityData[]> => {
  try {
    console.log('Loading vulnerability data from:', DATA_URL);

    // Use axios with onDownloadProgress for better reliability
    const response = await axios.get(DATA_URL, {
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    console.log('Data loaded successfully, processing...');

    let data = response.data;

    // Debug: Log the data structure
    console.log('Data type:', typeof data);
    console.log('Is array?:', Array.isArray(data));
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log('Object keys:', Object.keys(data));
    }

    // Handle nested structure with groups → repos → images → vulnerabilities
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data);
      console.log('Looking for data in keys:', keys);

      // Check if this is the nested groups structure
      if (data.groups && typeof data.groups === 'object') {
        console.log('Found nested groups structure, flattening...');
        const vulnerabilities: any[] = [];

        // Traverse: groups → repos → images → versions
        Object.entries(data.groups).forEach(([groupName, group]: [string, any]) => {
          if (group.repos && typeof group.repos === 'object') {
            Object.entries(group.repos).forEach(([repoName, repo]: [string, any]) => {
              if (repo.images && typeof repo.images === 'object') {
                Object.entries(repo.images).forEach(([version, image]: [string, any]) => {
                  // Each image might have vulnerabilities or be a vulnerability itself
                  if (image.vulnerabilities && Array.isArray(image.vulnerabilities)) {
                    // If it has a vulnerabilities array, add them
                    image.vulnerabilities.forEach((vuln: any) => {
                      // Transform riskFactors from object to array
                      let riskFactorsArray: string[] = [];
                      if (vuln.riskFactors && typeof vuln.riskFactors === 'object' && !Array.isArray(vuln.riskFactors)) {
                        riskFactorsArray = Object.keys(vuln.riskFactors);
                      } else if (Array.isArray(vuln.riskFactors)) {
                        riskFactorsArray = vuln.riskFactors;
                      }

                      vulnerabilities.push({
                        ...vuln,
                        package: vuln.packageName || repoName,
                        version: version,
                        groupName: groupName,
                        imageName: image.name || repoName,
                        riskFactors: riskFactorsArray,
                        timestamp: vuln.published || vuln.timestamp,
                      });
                    });
                  } else if (image.name || image.severity) {
                    // If the image itself is a vulnerability record
                    // Transform riskFactors from object to array
                    let riskFactorsArray: string[] = [];
                    if (image.riskFactors && typeof image.riskFactors === 'object' && !Array.isArray(image.riskFactors)) {
                      riskFactorsArray = Object.keys(image.riskFactors);
                    } else if (Array.isArray(image.riskFactors)) {
                      riskFactorsArray = image.riskFactors;
                    }

                    vulnerabilities.push({
                      ...image,
                      package: image.packageName || image.package || repoName,
                      version: version,
                      groupName: groupName,
                      riskFactors: riskFactorsArray,
                      timestamp: image.published || image.timestamp,
                    });
                  }
                });
              }
            });
          }
        });

        data = vulnerabilities;
        console.log(`Flattened ${data.length} vulnerability records from nested structure`);
      } else if (data.vulnerabilities) {
        data = data.vulnerabilities;
      } else if (data.data) {
        data = data.data;
      } else if (data.items) {
        data = data.items;
      } else if (keys.length === 1) {
        data = data[keys[0]];
      }
    }

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('Data structure:', JSON.stringify(data).substring(0, 500));
      throw new Error(`Data is not in expected format (expected array, got ${typeof data})`);
    }

    console.log(`Processing ${data.length} vulnerability records...`);

    // Ensure each item has an id and normalize severity to Title case
    const processedData = data.map((item, index) => ({
      ...item,
      id: item.id || `vuln-${index}`,
      severity: item.severity
        ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase()
        : item.severity,
    }));

    console.log('Data processing complete');

    return processedData;
  } catch (error: any) {
    console.error('Error loading vulnerability data:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

