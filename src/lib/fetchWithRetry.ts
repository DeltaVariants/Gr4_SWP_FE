// Utility function for retrying fetch with exponential backoff
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3
): Promise<Response> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(10000), // 10s default timeout
      });

      // If we get 502/503, retry after delay
      if ((response.status === 502 || response.status === 503) && i < retries - 1) {
        console.log(`[fetchWithRetry] Got ${response.status}, retrying (${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }

      return response; // Success or non-retryable error
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.log(`[fetchWithRetry] Fetch error, retrying (${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('All fetch retries failed');
}
