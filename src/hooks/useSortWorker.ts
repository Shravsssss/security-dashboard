import { useRef, useCallback, useEffect } from 'react';
import { VulnerabilityData } from '../types/vulnerability.types';

interface SortRequest {
  data: VulnerabilityData[];
  field: keyof VulnerabilityData | 'riskFactorsCount';
  direction: 'asc' | 'desc';
}

interface SortResult {
  data: VulnerabilityData[];
  error?: string;
}

/**
 * Custom hook to manage sort worker for async sorting
 * Prevents UI blocking when sorting large datasets
 */
export const useSortWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<number>(0);
  const pendingRequestsRef = useRef<Map<number, (result: SortResult) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    // Create worker instance
    workerRef.current = new Worker(
      new URL('../workers/sortWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle worker messages
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data, error, requestId } = e.data;

      const callback = pendingRequestsRef.current.get(requestId);
      if (!callback) return;

      if (type === 'SORT_COMPLETE') {
        callback({ data });
      } else if (type === 'SORT_ERROR') {
        callback({ data: [], error });
      }

      // Clean up request
      pendingRequestsRef.current.delete(requestId);
    };

    // Handle worker errors
    workerRef.current.onerror = (error) => {
      console.error('Sort worker error:', error);

      // Reject all pending requests
      pendingRequestsRef.current.forEach((callback) => {
        callback({
          data: [],
          error: 'Worker error: ' + error.message,
        });
      });
      pendingRequestsRef.current.clear();
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRequestsRef.current.clear();
    };
  }, []);

  /**
   * Sort data using web worker
   * Returns a promise that resolves with sorted data
   */
  const sortData = useCallback(
    (request: SortRequest): Promise<SortResult> => {
      return new Promise((resolve) => {
        if (!workerRef.current) {
          resolve({
            data: request.data,
            error: 'Worker not initialized',
          });
          return;
        }

        // Generate unique request ID
        const requestId = ++requestIdRef.current;

        // Store callback for this request
        pendingRequestsRef.current.set(requestId, resolve);

        // Send sort request to worker
        workerRef.current.postMessage({
          type: 'SORT',
          data: request.data,
          field: request.field,
          direction: request.direction,
          requestId,
        });
      });
    },
    []
  );

  return { sortData };
};
